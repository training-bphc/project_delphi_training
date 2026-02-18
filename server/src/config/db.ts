/**
 * DATABASE CONNECTION CONFIGURATION
 * 
 * Sets up PostgreSQL connection pool using pg library.
 * The pool manages multiple database connections efficiently,
 * reusing connections and handling connection limits.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL Connection Pool Configuration
// Pool maintains multiple connections that can be reused across requests
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Maximum number of connections in the pool
  max: 10,
  // Close idle connections after 30 seconds
  idleTimeoutMillis: 30000,
  // Fail fast if connection cannot be established within 2 seconds
  connectionTimeoutMillis: 2000,
});

// Event Handlers for Connection Pool

// Fires when a new client is connected to the pool
pool.on('connect', () => {
  console.log('[DB] New client connected to PostgreSQL');
});

// Fires when an unexpected error occurs on an idle client
pool.on('error', (err) => {
  console.error('[DB ERROR] Unexpected PostgreSQL pool error:', err);
  process.exit(1);
});

/**
 * Establishes initial connection to PostgreSQL database.
 * Tests the connection by acquiring and releasing a client.
 * Exits the process if connection fails.
 */
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
