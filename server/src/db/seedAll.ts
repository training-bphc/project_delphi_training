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

const getCategoryIdByName = async (
  client: any,
  categoryName: string,
): Promise<number> => {
  const result = await client.query(
    `SELECT category_id FROM training_point_categories WHERE category_name = $1 LIMIT 1`,
    [categoryName],
  );

  if (!result.rows[0]?.category_id) {
    throw new Error(`Category not found in training_point_categories: ${categoryName}`);
  }

  return result.rows[0].category_id;
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

    const bulkTestStudents = [
      { email: "f20250001@hyderabad.bits-pilani.ac.in", name: "Bulk Student 01", roll: "2025A8PS0001H" },
      { email: "f20250002@hyderabad.bits-pilani.ac.in", name: "Bulk Student 02", roll: "2025A8PS0002H" },
      { email: "f20250003@hyderabad.bits-pilani.ac.in", name: "Bulk Student 03", roll: "2025A8PS0003H" },
      { email: "f20250004@hyderabad.bits-pilani.ac.in", name: "Bulk Student 04", roll: "2025A8PS0004H" },
      { email: "f20250005@hyderabad.bits-pilani.ac.in", name: "Bulk Student 05", roll: "2025A8PS0005H" },
      { email: "f20250006@hyderabad.bits-pilani.ac.in", name: "Bulk Student 06", roll: "2025A8PS0006H" },
      { email: "f20250007@hyderabad.bits-pilani.ac.in", name: "Bulk Student 07", roll: "2025A8PS0007H" },
      { email: "f20250008@hyderabad.bits-pilani.ac.in", name: "Bulk Student 08", roll: "2025A8PS0008H" },
      { email: "f20250009@hyderabad.bits-pilani.ac.in", name: "Bulk Student 09", roll: "2025A8PS0009H" },
      { email: "f20250010@hyderabad.bits-pilani.ac.in", name: "Bulk Student 10", roll: "2025A8PS0010H" },
    ];

    for (const student of bulkTestStudents) {
      await client.query(
        `INSERT INTO students (email, student_name, roll_number, start_year, end_year, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO NOTHING`,
        [student.email, student.name, student.roll, 2025, 2029, true],
      );
    }

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

    const hackathonsCategoryId = await getCategoryIdByName(client, 'Hackathons/Competitions');
    const mockAssessmentsCategoryId = await getCategoryIdByName(client, 'Mock Assessments');
    const guestLecturesCategoryId = await getCategoryIdByName(client, 'Guest Lectures / Workshops');
    const sectorialBriefsCategoryId = await getCategoryIdByName(client, 'Sectorial Briefs');
    const mockInterviewsCategoryId = await getCategoryIdByName(client, 'Mock Interviews');

    // ── Seed training points ───────────────────────────────────
    await client.query(
      `
        DELETE FROM training_points
        WHERE added_by IN ($1, $2, $3)
      `,
      [
        "admin@hyderabad.bits-pilani.ac.in",
        "madhavramini@gmail.com",
        "f20231106@hyderabad.bits-pilani.ac.in",
      ],
    );

    await client.query(
      `
        INSERT INTO training_points (
          name,
          bits_id,
          email_id,
          date,
          category_id,
          added_by,
          verification_status,
          points,
          awarded_by
        )
        VALUES
          ('Viswa Somayajula', '2024A8PS0546H', 'f20240546@hyderabad.bits-pilani.ac.in', '2026-01-01', $1, 'admin@hyderabad.bits-pilani.ac.in', 'Verified', 5, 'admin@hyderabad.bits-pilani.ac.in'),
          ('Vedant Barve', '2023A8PS1100H', 'f20231100@hyderabad.bits-pilani.ac.in', '2026-01-02', $2, 'madhavramini@gmail.com', 'Verified', 8, 'madhavramini@gmail.com'),
          ('Madhav', '2023A8PS0046H', 'f20230046@hyderabad.bits-pilani.ac.in', '2026-02-20', $3, 'admin@hyderabad.bits-pilani.ac.in', 'Verified', 10, 'admin@hyderabad.bits-pilani.ac.in'),
          ('Siddharth', '2023A8PS1106H', 'f20231106@hyderabad.bits-pilani.ac.in', '2026-02-21', $4, 'f20231106@hyderabad.bits-pilani.ac.in', 'Pending', 0, NULL)
      ;
      `,
      [
        hackathonsCategoryId,
        mockAssessmentsCategoryId,
        guestLecturesCategoryId,
        sectorialBriefsCategoryId,
      ],
    );

    // ── Seed hackathon submissions (verification requests) ─────
    await client.query(`DELETE FROM hackathon_submissions`);

    await client.query(
      `
        INSERT INTO hackathon_submissions (
          student_id,
          category_id,
          description,
          proof_links,
          status,
          awarded_by
        )
        VALUES
          ($1, $4, 'HackerEarth Hackathon participation', ARRAY['https://hackerearth.com/challenges/hack2026'], 'Pending', NULL),
          ($2, $5, 'Python workshop attended', ARRAY['https://example.com/workshop-cert'], 'Verified', 'admin@hyderabad.bits-pilani.ac.in'),
          ($3, $6, 'Mock interview session', ARRAY['https://drive.google.com/file/d/example'], 'Pending', NULL)
      `,
      [
        student1Id,
        student2Id,
        student3Id,
        hackathonsCategoryId,
        guestLecturesCategoryId,
        mockInterviewsCategoryId,
      ],
    );

    // ── Seed resources module sample tree ─────────────────────
    await client.query(`DELETE FROM resources`);
    await client.query(`DELETE FROM resource_folders`);

    const rootFolder = await client.query<{ folder_id: number }>(
      `
        INSERT INTO resource_folders (folder_name, parent_folder_id, domain_id, created_by)
        VALUES ($1, NULL, NULL, $2)
        RETURNING folder_id
      `,
      ['Placement Prep', 'admin@hyderabad.bits-pilani.ac.in'],
    );

    const rootFolderId = rootFolder.rows[0].folder_id;

    const interviewFolder = await client.query<{ folder_id: number }>(
      `
        INSERT INTO resource_folders (folder_name, parent_folder_id, domain_id, created_by)
        VALUES ($1, $2, NULL, $3)
        RETURNING folder_id
      `,
      ['Interview Prep', rootFolderId, 'admin@hyderabad.bits-pilani.ac.in'],
    );

    const codingFolder = await client.query<{ folder_id: number }>(
      `
        INSERT INTO resource_folders (folder_name, parent_folder_id, domain_id, created_by)
        VALUES ($1, $2, NULL, $3)
        RETURNING folder_id
      `,
      ['Coding Practice', rootFolderId, 'madhavramini@gmail.com'],
    );

    await client.query(
      `
        INSERT INTO resources (resource_name, resource_type, file_url, folder_id, uploaded_by)
        VALUES
          ('NeetCode Roadmap', 'external_link', 'https://neetcode.io/roadmap', $1, 'madhavramini@gmail.com'),
          ('LeetCode Interview Guide', 'external_link', 'https://leetcode.com/explore/interview/card/top-interview-questions-easy/', $1, 'admin@hyderabad.bits-pilani.ac.in'),
          ('System Design Primer', 'external_link', 'https://github.com/donnemartin/system-design-primer', $2, 'admin@hyderabad.bits-pilani.ac.in')
      `,
      [codingFolder.rows[0].folder_id, interviewFolder.rows[0].folder_id],
    );

    void student4Id;

    await client.query("COMMIT");
    console.log("[DB] Test data seeded successfully");
    console.log("[DB] Test Students:");
    console.log("     f20240546@hyderabad.bits-pilani.ac.in");
    console.log("     f20230046@hyderabad.bits-pilani.ac.in");
    console.log("[DB] Bulk Upload Test Students:");
    for (const student of bulkTestStudents) {
      console.log(`     ${student.email}`);
    }
    console.log("[DB] Test Admins:");
    console.log("     admin@hyderabad.bits-pilani.ac.in");
    console.log("     madhavramini@gmail.com");
    console.log("[DB] Resources seed added:");
    console.log("     Root: Placement Prep");
    console.log("     Children: Interview Prep, Coding Practice");
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
