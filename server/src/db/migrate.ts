import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import pool from "../config/db";
import dotenv from "dotenv";

dotenv.config();

const runMigrations = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    console.log("Running migrations...");

    const migrationsDir = join(__dirname, "migrations");
    const migrationFiles = readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const appliedResult = await client.query<{ filename: string }>(
      "SELECT filename FROM schema_migrations",
    );
    const appliedFiles = new Set(appliedResult.rows.map((row) => row.filename));

    for (const file of migrationFiles) {
      if (appliedFiles.has(file)) {
        console.log(`Skipping already applied migration: ${file}`);
        continue;
      }

      const migrationPath = join(migrationsDir, file);
      const sql = readFileSync(migrationPath, "utf-8");

      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1)",
        [file],
      );
      await client.query("COMMIT");

      console.log(`Applied migration: ${file}`);
    }

    console.log("Migrations completed successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed, rolling back:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations();
