/**
 * Unified seed script for test data (users + training records)
 * Run with: npm run db:seed
 */
import pool from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    console.log('[DB] Seeding test data...');
    await client.query('BEGIN');

    // ── Create batch ────────────────────────────────────────────
    const batchResult = await client.query(
      'INSERT INTO batches (batch_name, start_year, end_year) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING batch_id',
      ['2024-2025', 2024, 2025]
    );

    let batchId = 1;
    if (batchResult.rows.length > 0) {
      batchId = batchResult.rows[0].batch_id;
    }

    // ── Seed students ───────────────────────────────────────────
    await client.query(
      `INSERT INTO students (email, student_name, roll_number, start_year, end_year, batch_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING`,
      [
        'f20240546@hyderabad.bits-pilani.ac.in',
        'Viswa Somayajula',
        '2024A8PS0546H',
        2024,
        2025,
        batchId,
        true,
      ]
    );

    await client.query(
      `INSERT INTO students (email, student_name, roll_number, start_year, end_year, batch_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING`,
      [
        'f20230046@hyderabad.bits-pilani.ac.in',
        'Madhav Ramini',
        '2023A8PS0046H',
        2023,
        2027,
        batchId,
        true,
      ]
    );

    // ── Seed admins ─────────────────────────────────────────────
    await client.query(
      `INSERT INTO admins (email, admin_name, department, is_super_admin)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [
        'admin@hyderabad.bits-pilani.ac.in',
        'Test Admin',
        'Training Unit',
        true,
      ]
    );

    await client.query(
      `INSERT INTO admins (email, admin_name, department, is_super_admin)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [
        'madhavramini@gmail.com',
        'Madhav Ramini',
        'Training Unit',
        true,
      ]
    );

    // ── Seed training records ───────────────────────────────────
    await client.query(
      `
        DELETE FROM training_records
        WHERE added_by = $1
      `,
      ['API_TEST_SEED'],
    );

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
          ('Viswa Somayajula', '2024A8PS0546H', 'f20240546@hyderabad.bits-pilani.ac.in', '2026-01-01', 'Hackathons/Competitions', 'API_TEST_SEED', 'Pending', 0),
          ('Vedant Barve', '2023A8PS1100H', 'f20231100@hyderabad.bits-pilani.ac.in', '2026-01-02', 'Mock Assessments', 'API_TEST_SEED', 'Verified', 8),
          ('Madhav', '2023A8PS0046H', 'f20230046@hyderabad.bits-pilani.ac.in', '2026-02-20', 'Guest Lectures / Workshops', 'API_TEST_SEED', 'Pending', 0),
          ('Siddharth', '2023A8PS1106H', 'f20231106@hyderabad.bits-pilani.ac.in', '2026-02-21', 'Sectorial Briefs', 'API_TEST_SEED', 'Pending', 0)
      ;
      `,
    );

    await client.query('COMMIT');
    console.log('[DB] Test data seeded successfully');
    console.log('[DB] Test Students:');
    console.log('     f20240546@hyderabad.bits-pilani.ac.in');
    console.log('     f20230046@hyderabad.bits-pilani.ac.in');
    console.log('[DB] Test Admins:');
    console.log('     admin@hyderabad.bits-pilani.ac.in');
    console.log('     madhavramini@gmail.com');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[DB] Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

seedData();
