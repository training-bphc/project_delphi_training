import dotenv from 'dotenv';
import pool from '../config/db';

dotenv.config();

const resetDatabase = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    console.log('[DB] Resetting database schema...');
    await client.query('BEGIN');

    await client.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await client.query('CREATE SCHEMA public;');
    await client.query('GRANT ALL ON SCHEMA public TO public;');

    await client.query('COMMIT');
    console.log('[DB] Database reset complete. Run migrations again to recreate tables.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[DB] Database reset failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

resetDatabase();
