import pool from '../config/db';
import { ResolvedTrainingRecordInput, TrainingRecord, VerificationStatus } from '../types';

const SELECT_COLUMNS = `
  SELECT
    s_no,
    name,
    bits_id,
    email_id,
    date::text AS date,
    category,
    added_by,
    verification_status,
    points
  FROM training_records
`;

export const findAllRecords = async (
  status?: VerificationStatus,
): Promise<TrainingRecord[]> => {
  if (status) {
    const result = await pool.query<TrainingRecord>(
      `${SELECT_COLUMNS} WHERE verification_status = $1 ORDER BY s_no ASC`,
      [status],
    );
    return result.rows;
  }

  const result = await pool.query<TrainingRecord>(
    `${SELECT_COLUMNS} ORDER BY s_no ASC`,
  );
  return result.rows;
};

export const findRecordByBitsId = async (
  bitsId: string,
): Promise<TrainingRecord | null> => {
  const result = await pool.query<TrainingRecord>(
    `${SELECT_COLUMNS} WHERE bits_id = $1 LIMIT 1`,
    [bitsId],
  );

  return result.rows[0] ?? null;
};

export const findStudentIdentityByEmail = async (
  email: string,
): Promise<{ student_name: string; roll_number: string } | null> => {
  const result = await pool.query<{ student_name: string; roll_number: string }>(
    `
      SELECT student_name, roll_number
      FROM students
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email],
  );

  console.log('[REPO] findStudentIdentityByEmail(', email, ') -> rows:', result.rows.length);
  if (result.rows[0]) {
    console.log('[REPO]   Found:', result.rows[0]);
  }
  return result.rows[0] ?? null;
};

export const findRecordIdentityByEmail = async (
  email: string,
): Promise<{ name: string; bits_id: string } | null> => {
  const result = await pool.query<{ name: string; bits_id: string }>(
    `
      SELECT name, bits_id
      FROM training_records
      WHERE LOWER(email_id) = LOWER($1)
      ORDER BY s_no DESC
      LIMIT 1
    `,
    [email],
  );

  console.log('[REPO] findRecordIdentityByEmail(', email, ') -> rows:', result.rows.length);
  if (result.rows[0]) {
    console.log('[REPO]   Found:', result.rows[0]);
  }
  return result.rows[0] ?? null;
};

export const createRecord = async (
  payload: ResolvedTrainingRecordInput,
): Promise<TrainingRecord> => {
  console.log('[REPO] createRecord inserting with points:', payload.points, 'verification_status:', payload.verification_status);
  const result = await pool.query<TrainingRecord>(
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        s_no,
        name,
        bits_id,
        email_id,
        date::text AS date,
        category,
        added_by,
        verification_status,
        points
    `,
    [
      payload.name,
      payload.bits_id,
      payload.email_id,
      payload.date,
      payload.category,
      payload.added_by,
      payload.verification_status ?? 'Pending',
      payload.points ?? 0,
    ],
  );

  console.log('[REPO] createRecord RETURNED record with points:', result.rows[0]?.points, 'verification_status:', result.rows[0]?.verification_status);
  return result.rows[0];
};

export const markRecordAsVerified = async (
  serialNo: number,
): Promise<TrainingRecord | null> => {
  const result = await pool.query<TrainingRecord>(
    `
      UPDATE training_records
      SET verification_status = 'Verified'
      WHERE s_no = $1
      RETURNING
        s_no,
        name,
        bits_id,
        email_id,
        date::text AS date,
        category,
        added_by,
        verification_status,
        points
    `,
    [serialNo],
  );

  return result.rows[0] ?? null;
};
