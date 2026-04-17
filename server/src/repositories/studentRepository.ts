import pool from "../config/db";
import { Student, SectorType } from "../types";

export interface StudentInsertPayload {
  email: string;
  student_name: string;
  roll_number: string;
  start_year: number;
  end_year: number;
  cgpa: number;
  sector: SectorType;
}

/**
 * Find a single student by email
 */
export const findStudentByEmail = async (
  email: string,
): Promise<Student | null> => {
  const result = await pool.query<Student>(
    `
      SELECT student_id, email, student_name, roll_number, start_year, end_year, cgpa, sector
      FROM students
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email],
  );

  return result.rows[0] ?? null;
};

/**
 * Check for email uniqueness in the database
 * Returns array of emails that already exist
 */
export const validateEmailUniqueness = async (
  emails: string[],
): Promise<string[]> => {
  if (emails.length === 0) {
    return [];
  }

  const result = await pool.query<{ email: string }>(
    `
      SELECT LOWER(email) as email FROM students
      WHERE LOWER(email) = ANY($1::text[])
    `,
    [emails.map((e) => e.toLowerCase())],
  );

  return result.rows.map((row) => row.email);
};

/**
 * Find multiple students by emails in a single query
 * Returns a map of lowercase email -> Student
 */
export const findStudentsByEmails = async (
  emails: string[],
): Promise<Map<string, Student>> => {
  if (emails.length === 0) {
    return new Map();
  }

  const result = await pool.query<Student>(
    `
      SELECT student_id, email, student_name, roll_number, start_year, end_year, cgpa, sector
      FROM students
      WHERE LOWER(email) = ANY($1::text[])
    `,
    [emails.map((e) => e.toLowerCase())],
  );

  const map = new Map<string, Student>();
  for (const row of result.rows) {
    map.set(row.email.toLowerCase(), row);
  }
  return map;
};

/**
 * Bulk insert students into the database
 * Returns the inserted students or throws an error
 */
export const insertBulkStudents = async (
  students: StudentInsertPayload[],
): Promise<Student[]> => {
  if (students.length === 0) {
    return [];
  }

  const placeholders = students
    .map(
      (_, index) =>
        `($${index * 7 + 1}, $${index * 7 + 2}, $${index * 7 + 3}, $${index * 7 + 4}, $${index * 7 + 5}, $${index * 7 + 6}, $${index * 7 + 7})`,
    )
    .join(",");

  const values: (string | number)[] = [];
  for (const student of students) {
    values.push(
      student.email,
      student.student_name,
      student.roll_number,
      student.start_year,
      student.end_year,
      student.cgpa,
      student.sector,
    );
  }

  const result = await pool.query<Student>(
    `
      INSERT INTO students (email, student_name, roll_number, start_year, end_year, cgpa, sector)
      VALUES ${placeholders}
      ON CONFLICT (email) DO NOTHING
      RETURNING student_id, email, student_name, roll_number, start_year, end_year, cgpa, sector
    `,
    values,
  );

  return result.rows;
};

/**
 * Get all students grouped by graduating batch (end_year)
 */
export const getStudentsByGraduatingBatch = async (): Promise<{
  [batch: number]: Student[];
}> => {
  const result = await pool.query<Student & { end_year: number }>(
    `
      SELECT student_id, email, student_name, roll_number, start_year, end_year, cgpa, sector
      FROM students
      ORDER BY end_year DESC, student_name ASC
    `,
  );

  const grouped: { [batch: number]: Student[] } = {};

  for (const student of result.rows) {
    const batch = student.end_year;
    if (!grouped[batch]) {
      grouped[batch] = [];
    }
    grouped[batch].push({
      student_id: student.student_id,
      email: student.email,
      student_name: student.student_name,
      roll_number: student.roll_number,
      start_year: student.start_year,
      end_year: student.end_year,
      cgpa: student.cgpa,
      sector: student.sector,
    });
  }

  return grouped;
};