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
      .filter((file) => file !== "002_remove_batches_add_verification_undo.sql")
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

    const requiredBaselineTables = [
      "training_point_categories",
      "training_points",
      "hackathon_submissions",
    ];

    const missingTablesResult = await client.query<{ table_name: string }>(
      `
        SELECT t.table_name
        FROM (SELECT unnest($1::text[]) AS table_name) t
        LEFT JOIN information_schema.tables ist
          ON ist.table_schema = 'public'
         AND ist.table_name = t.table_name
        WHERE ist.table_name IS NULL
      `,
      [requiredBaselineTables],
    );

    if (
      appliedFiles.has("001_initial_schema.sql") &&
      missingTablesResult.rows.length > 0
    ) {
      console.warn(
        `[DB] Baseline migration marked applied but missing tables: ${missingTablesResult.rows
          .map((row) => row.table_name)
          .join(", ")}. Reapplying 001_initial_schema.sql.`,
      );

      await client.query(
        "DELETE FROM schema_migrations WHERE filename = '001_initial_schema.sql'",
      );
      appliedFiles.delete("001_initial_schema.sql");
    }

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
