import { Pool } from 'pg';
import dotenv   from 'dotenv';

dotenv.config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max:                     10,
  idleTimeoutMillis:       30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
  console.log('[DB] New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB ERROR] Unexpected PostgreSQL pool error:', err);
  process.exit(1);
});

export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('[DB] PostgreSQL connected successfully');
    client.release();
  } catch (err) {
    console.error('[DB ERROR] PostgreSQL connection failed:', err);
    process.exit(1);
  }
};

export default pool;
