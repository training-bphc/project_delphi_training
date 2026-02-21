import { readdirSync, readFileSync } from 'fs';
import { join }         from 'path';
import pool             from '../config/db';
import dotenv           from 'dotenv';

dotenv.config();

const runMigrations = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    console.log('Running migrations...');

    const migrationsDir = join(__dirname, 'migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    await client.query('BEGIN');
    for (const file of migrationFiles) {
      const migrationPath = join(migrationsDir, file);
      const sql = readFileSync(migrationPath, 'utf-8');
      await client.query(sql);
      console.log(`Applied migration: ${file}`);
    }
    await client.query('COMMIT');

    console.log('Migrations completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed, rolling back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations();
