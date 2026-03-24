/**
 * Unified seed script for test data (users + training records)
 * Run with: npm run db:seed
 */
import pool from "../config/db";
import dotenv from "dotenv";

dotenv.config();

const getStudentIdByEmail = async (
  client: any,
  email: string,
): Promise<number> => {
  const result = await client.query(
    `SELECT student_id FROM students WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email],
  );

  if (!result.rows[0]?.student_id) {
    throw new Error(`Student not found after seed upsert: ${email}`);
  }

  return result.rows[0].student_id;
};

const seedData = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    console.log("[DB] Seeding test data...");
    await client.query("BEGIN");

    // ── Seed students ───────────────────────────────────────────
    const studentResult1 = await client.query(
      `INSERT INTO students (email, student_name, roll_number, start_year, end_year, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING student_id`,
      [
        "f20240546@hyderabad.bits-pilani.ac.in",
        "Viswa Somayajula",
        "2024A8PS0546H",
        2024,
        2025,
        true,
      ],
    );
    const student1Id =
      studentResult1.rows[0]?.student_id ||
      (await getStudentIdByEmail(client, "f20240546@hyderabad.bits-pilani.ac.in"));

    const studentResult2 = await client.query(
      `INSERT INTO students (email, student_name, roll_number, start_year, end_year, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING student_id`,
      [
        "f20231100@hyderabad.bits-pilani.ac.in",
        "Vedant Barve",
        "2023A8PS1100H",
        2023,
        2027,
        true,
      ],
    );
    const student2Id =
      studentResult2.rows[0]?.student_id ||
      (await getStudentIdByEmail(client, "f20231100@hyderabad.bits-pilani.ac.in"));

    const studentResult3 = await client.query(
      `INSERT INTO students (email, student_name, roll_number, start_year, end_year, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING student_id`,
      [
        "f20231106@hyderabad.bits-pilani.ac.in",
        "Siddharth",
        "2023A8PS1106H",
        2023,
        2027,
        true,
      ],
    );
    const student3Id =
      studentResult3.rows[0]?.student_id ||
      (await getStudentIdByEmail(client, "f20231106@hyderabad.bits-pilani.ac.in"));

    const studentResult4 = await client.query(
      `INSERT INTO students (email, student_name, roll_number, start_year, end_year, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING student_id`,
      [
        "f20230046@hyderabad.bits-pilani.ac.in",
        "Madhav Ramini",
        "2023A8PS0046H",
        2023,
        2027,
        true,
      ],
    );
    const student4Id =
      studentResult4.rows[0]?.student_id ||
      (await getStudentIdByEmail(client, "f20230046@hyderabad.bits-pilani.ac.in"));

    // ── Seed admins ─────────────────────────────────────────────
    await client.query(
      `INSERT INTO admins (email, admin_name, department, is_super_admin)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [
        "admin@hyderabad.bits-pilani.ac.in",
        "Test Admin",
        "Training Unit",
        true,
      ],
    );

    await client.query(
      `INSERT INTO admins (email, admin_name, department, is_super_admin)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ["madhavramini@gmail.com", "Madhav Ramini", "Training Unit", true],
    );

    // ── Seed training records ───────────────────────────────────
    await client.query(
      `
        DELETE FROM training_records
        WHERE added_by = $1
      `,
      ["API_TEST_SEED"],
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
          ('Viswa Somayajula', '2024A8PS0546H', 'f20240546@hyderabad.bits-pilani.ac.in', '2026-01-01', 'Hackathons/Competitions', 'API_TEST_SEED', 'Verified', 5),
          ('Vedant Barve', '2023A8PS1100H', 'f20231100@hyderabad.bits-pilani.ac.in', '2026-01-02', 'Mock Assessments', 'API_TEST_SEED', 'Verified', 8),
          ('Madhav', '2023A8PS0046H', 'f20230046@hyderabad.bits-pilani.ac.in', '2026-02-20', 'Guest Lectures / Workshops', 'API_TEST_SEED', 'Verified', 10),
          ('Siddharth', '2023A8PS1106H', 'f20231106@hyderabad.bits-pilani.ac.in', '2026-02-21', 'Sectorial Briefs', 'API_TEST_SEED', 'Pending', 0)
      ;
      `,
    );

    // ── Seed verification requests ──────────────────────────────
    await client.query(`DELETE FROM verification_requests`);

    await client.query(
      `
        INSERT INTO verification_requests (
          student_id,
          category,
          description,
          proof_links,
          status
        )
        VALUES
          ($1, 'Hackathons/Competitions', 'HackerEarth Hackathon participation', ARRAY['https://hackerearth.com/challenges/hack2026'], 'Pending'),
          ($2, 'Guest Lectures / Workshops', 'Python workshop attended', ARRAY['https://example.com/workshop-cert'], 'Verified'),
          ($3, 'Mock Interviews', 'Mock interview session', ARRAY['https://drive.google.com/file/d/example'], 'Pending')
      `,
      [student1Id, student2Id, student3Id],
    );

    void student4Id;

    await client.query("COMMIT");
    console.log("[DB] Test data seeded successfully");
    console.log("[DB] Test Students:");
    console.log("     f20240546@hyderabad.bits-pilani.ac.in");
    console.log("     f20230046@hyderabad.bits-pilani.ac.in");
    console.log("[DB] Test Admins:");
    console.log("     admin@hyderabad.bits-pilani.ac.in");
    console.log("     madhavramini@gmail.com");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[DB] Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

seedData();
