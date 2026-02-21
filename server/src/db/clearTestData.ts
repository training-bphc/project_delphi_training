import dotenv from 'dotenv';
import pool from '../config/db';

dotenv.config();

const clearTrainingRecordSeeds = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await client.query(
      `
        DELETE FROM training_records
        WHERE added_by = $1
      `,
      ['API_TEST_SEED'],
    );

    await client.query('COMMIT');
    console.log(`[DB] Removed ${result.rowCount ?? 0} test training records`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[DB] Failed to clear test training records:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

clearTrainingRecordSeeds();
