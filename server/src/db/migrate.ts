import { readFileSync } from 'fs';
import { join }         from 'path';
import pool             from '../config/db';
import dotenv           from 'dotenv';

dotenv.config();

const runMigrations = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    console.log('Running migrations...');

    const migrationPath = join(__dirname, 'migrations', '001_initial_schema.sql');
    const sql           = readFileSync(migrationPath, 'utf-8');

    await client.query('BEGIN');
    await client.query(sql);
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
