import dotenv from 'dotenv';
import pool from '../config/db';

dotenv.config();

const seedTrainingRecords = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `
        INSERT INTO training_records (
          name,
          bits_id,
          email_id,
          date,
          category,
          added_by,
          verification_status,
          points
        )
        VALUES
          ('Viswa Somayajula', '20240546', 'f20240546@bits-pilani.ac.in', '2026-01-01', 'Hackathon', 'API_TEST_SEED', 'Pending', 0),
          ('Vedant Barve', '20231100', 'f20231100@bits-pilani.ac.in', '2026-01-02', 'Lecture Session', 'API_TEST_SEED', 'Verified', 7),
          ('Madhav', '20230046', 'f20230046@bits-pilani.ac.in', '2026-02-20', 'Workshop', 'API_TEST_SEED', 'Pending', 0),
          ('Siddharth', '20231106', 'f20231106@bits-pilani.ac.in', '2026-02-21', 'Seminar', 'API_TEST_SEED', 'Pending', 0)
        ON CONFLICT (bits_id) DO UPDATE
        SET
          name = EXCLUDED.name,
          email_id = EXCLUDED.email_id,
          date = EXCLUDED.date,
          category = EXCLUDED.category,
          added_by = EXCLUDED.added_by,
          verification_status = EXCLUDED.verification_status,
          points = EXCLUDED.points;
      `,
    );

    await client.query('COMMIT');
    console.log('[DB] Test training records seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[DB] Failed to seed test training records:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

seedTrainingRecords();
