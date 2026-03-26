import pool from "../config/db";
import {
  CreateVerificationRequestInput,
  RequestStatus,
  ResolvedTrainingRecordInput,
  TrainingPointCategory,
  TrainingRecord,
  VerificationRequest,
  VerificationStatus,
} from "../types";

const RECORD_SELECT = `
  SELECT
    tp.s_no,
    tp.name,
    tp.bits_id,
    tp.email_id,
    tp.date::text AS date,
    tp.category_id,
    tpc.category_name AS category,
    tp.added_by,
    tp.verification_status,
    tp.points,
    tp.awarded_by,
    tp.deleted_at
  FROM training_points tp
  JOIN training_point_categories tpc ON tpc.category_id = tp.category_id
`;

const REQUEST_SELECT = `
  SELECT
    hs.request_id,
    hs.student_id,
    s.student_name,
    s.email AS student_email,
    s.roll_number AS student_bits_id,
    hs.category_id,
    tpc.category_name AS category,
    hs.description,
    hs.proof_links,
    hs.status,
    hs.rejection_reason,
    hs.awarded_by,
    hs.created_at::text AS created_at,
    hs.updated_at::text AS updated_at
  FROM hackathon_submissions hs
  JOIN students s ON s.student_id = hs.student_id
  JOIN training_point_categories tpc ON tpc.category_id = hs.category_id
`;

export const findAllRecords = async (
  status?: VerificationStatus,
): Promise<TrainingRecord[]> => {
  if (status) {
    const result = await pool.query<TrainingRecord>(
      `${RECORD_SELECT}
       WHERE tp.deleted_at IS NULL AND tp.verification_status = $1
       ORDER BY tp.s_no ASC`,
      [status],
    );
    return result.rows;
  }

  const result = await pool.query<TrainingRecord>(
    `${RECORD_SELECT}
     WHERE tp.deleted_at IS NULL
     ORDER BY tp.s_no ASC`,
  );
  return result.rows;
};

export const findRecordByBitsId = async (
  bitsId: string,
): Promise<TrainingRecord | null> => {
  const result = await pool.query<TrainingRecord>(
    `${RECORD_SELECT}
     WHERE tp.deleted_at IS NULL AND tp.bits_id = $1
     ORDER BY tp.s_no DESC
     LIMIT 1`,
    [bitsId],
  );

  return result.rows[0] ?? null;
};

export const findStudentIdentityByEmail = async (
  email: string,
): Promise<{ student_name: string; roll_number: string } | null> => {
  const result = await pool.query<{
    student_name: string;
    roll_number: string;
  }>(
    `
      SELECT student_name, roll_number
      FROM students
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email],
  );

  return result.rows[0] ?? null;
};

export const findCategoryById = async (
  categoryId: number,
): Promise<TrainingPointCategory | null> => {
  const result = await pool.query<TrainingPointCategory>(
    `
      SELECT category_id, category_name, description, max_points, is_mythology
      FROM training_point_categories
      WHERE category_id = $1
      LIMIT 1
    `,
    [categoryId],
  );

  return result.rows[0] ?? null;
};

export const findAllCategories = async (): Promise<TrainingPointCategory[]> => {
  const result = await pool.query<TrainingPointCategory>(
    `
      SELECT category_id, category_name, description, max_points, is_mythology
      FROM training_point_categories
      ORDER BY category_name ASC
    `,
  );
  return result.rows;
};

export const createRecord = async (
  payload: ResolvedTrainingRecordInput,
): Promise<TrainingRecord> => {
  const result = await pool.query<TrainingRecord>(
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        s_no,
        name,
        bits_id,
        email_id,
        date::text AS date,
        category_id,
        added_by,
        verification_status,
        points,
        awarded_by,
        deleted_at
    `,
    [
      payload.name,
      payload.bits_id,
      payload.email_id,
      payload.date,
      payload.category_id,
      payload.added_by,
      payload.verification_status ?? "Pending",
      payload.points ?? 0,
      payload.awarded_by ?? null,
    ],
  );

  const row = result.rows[0];
  const category = await findCategoryById(row.category_id);
  return {
    ...row,
    category: category?.category_name ?? "Unknown",
  };
};

export const markRecordAsVerified = async (
  serialNo: number,
  adminEmail?: string,
): Promise<TrainingRecord | null> => {
  const result = await pool.query<TrainingRecord>(
    `
      UPDATE training_points tp
      SET verification_status = 'Verified',
          awarded_by = COALESCE($2, tp.awarded_by)
      WHERE tp.s_no = $1 AND tp.deleted_at IS NULL
      RETURNING
        tp.s_no,
        tp.name,
        tp.bits_id,
        tp.email_id,
        tp.date::text AS date,
        tp.category_id,
        tp.added_by,
        tp.verification_status,
        tp.points,
        tp.awarded_by,
        tp.deleted_at
    `,
    [serialNo, adminEmail ?? null],
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  const category = await findCategoryById(row.category_id);
  return {
    ...row,
    category: category?.category_name ?? "Unknown",
  };
};

export const softDeleteRecord = async (
  serialNo: number,
): Promise<TrainingRecord | null> => {
  const result = await pool.query<TrainingRecord>(
    `
      UPDATE training_points tp
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE tp.s_no = $1 AND tp.deleted_at IS NULL
      RETURNING
        tp.s_no,
        tp.name,
        tp.bits_id,
        tp.email_id,
        tp.date::text AS date,
        tp.category_id,
        tp.added_by,
        tp.verification_status,
        tp.points,
        tp.awarded_by,
        tp.deleted_at
    `,
    [serialNo],
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  const category = await findCategoryById(row.category_id);
  return {
    ...row,
    category: category?.category_name ?? "Unknown",
  };
};

export const restoreRecord = async (
  serialNo: number,
): Promise<TrainingRecord | null> => {
  const result = await pool.query<TrainingRecord>(
    `
      UPDATE training_points tp
      SET deleted_at = NULL
      WHERE tp.s_no = $1
      RETURNING
        tp.s_no,
        tp.name,
        tp.bits_id,
        tp.email_id,
        tp.date::text AS date,
        tp.category_id,
        tp.added_by,
        tp.verification_status,
        tp.points,
        tp.awarded_by,
        tp.deleted_at
    `,
    [serialNo],
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  const category = await findCategoryById(row.category_id);
  return {
    ...row,
    category: category?.category_name ?? "Unknown",
  };
};

export const findAllVerificationRequests = async (
  status?: RequestStatus,
): Promise<VerificationRequest[]> => {
  if (status) {
    const result = await pool.query<VerificationRequest>(
      `${REQUEST_SELECT}
       WHERE hs.status = $1
       ORDER BY hs.created_at DESC`,
      [status],
    );
    return result.rows;
  }

  const result = await pool.query<VerificationRequest>(
    `${REQUEST_SELECT}
     ORDER BY hs.created_at DESC`,
  );
  return result.rows;
};

export const findVerificationRequestsForStudent = async (
  studentEmail: string,
  status?: RequestStatus,
): Promise<VerificationRequest[]> => {
  if (status) {
    const result = await pool.query<VerificationRequest>(
      `${REQUEST_SELECT}
       WHERE LOWER(s.email) = LOWER($1) AND hs.status = $2
       ORDER BY hs.created_at DESC`,
      [studentEmail, status],
    );
    return result.rows;
  }

  const result = await pool.query<VerificationRequest>(
    `${REQUEST_SELECT}
     WHERE LOWER(s.email) = LOWER($1)
     ORDER BY hs.created_at DESC`,
    [studentEmail],
  );
  return result.rows;
};

export const createVerificationRequest = async (
  studentEmail: string,
  payload: CreateVerificationRequestInput,
): Promise<VerificationRequest> => {
  const studentResult = await pool.query<{
    student_id: number;
    student_name: string;
    email: string;
  }>(
    `
      SELECT student_id, student_name, email
      FROM students
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [studentEmail],
  );

  const student = studentResult.rows[0];
  if (!student) {
    throw new Error("Student not found");
  }

  if (student.email.toLowerCase() !== payload.student_email.toLowerCase()) {
    throw new Error("Submitted email must match logged-in student email");
  }

  if (
    student.student_name.trim().toLowerCase() !==
    payload.student_name.trim().toLowerCase()
  ) {
    throw new Error("Submitted name must match logged-in student name");
  }

  const categoryResult = await pool.query<{ category_id: number }>(
    `
      SELECT category_id
      FROM training_point_categories
      WHERE category_name = 'Hackathons/Competitions'
      LIMIT 1
    `,
  );

  const category = categoryResult.rows[0];
  if (!category) {
    throw new Error("Hackathons/Competitions category not found");
  }

  const insertResult = await pool.query<{ request_id: number }>(
    `
      INSERT INTO hackathon_submissions (
        student_id,
        category_id,
        description,
        proof_links,
        status,
        rejection_reason,
        awarded_by
      ) VALUES ($1, $2, $3, ARRAY[$4], 'Pending', NULL, NULL)
      RETURNING request_id
    `,
    [
      student.student_id,
      category.category_id,
      "Hackathon verification request",
      payload.proof_link,
    ],
  );

  const created = await findVerificationRequestById(
    insertResult.rows[0].request_id,
  );
  if (!created) {
    throw new Error("Failed to create verification request");
  }

  return created;
};

export const findVerificationRequestById = async (
  requestId: number,
): Promise<VerificationRequest | null> => {
  const result = await pool.query<VerificationRequest>(
    `${REQUEST_SELECT}
     WHERE hs.request_id = $1`,
    [requestId],
  );

  return result.rows[0] ?? null;
};

export const updateVerificationRequestStatus = async (
  requestId: number,
  newStatus: RequestStatus,
  adminEmail?: string,
  rejectionReason?: string,
): Promise<VerificationRequest | null> => {
  const result = await pool.query<{ student_id: number; category_id: number }>(
    `
      UPDATE hackathon_submissions hs
      SET status = $1,
          rejection_reason = CASE
            WHEN $1 = 'Rejected' THEN $4
            ELSE NULL
          END,
          updated_at = CURRENT_TIMESTAMP,
          awarded_by = CASE
            WHEN $1 = 'Verified' THEN COALESCE($3, hs.awarded_by)
            ELSE hs.awarded_by
          END
      WHERE hs.request_id = $2
      RETURNING hs.student_id, hs.category_id
    `,
    [newStatus, requestId, adminEmail ?? null, rejectionReason ?? null],
  );

  const requestRow = await findVerificationRequestById(requestId);

  if (newStatus === "Verified" && result.rows[0]) {
    const studentResult = await pool.query<{
      student_name: string;
      roll_number: string;
      email: string;
    }>(
      `
        SELECT student_name, roll_number, email
        FROM students
        WHERE student_id = $1
        LIMIT 1
      `,
      [result.rows[0].student_id],
    );

    const student = studentResult.rows[0];
    if (student) {
      await pool.query(
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
          ) VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, 'Verified', 0, $6)
        `,
        [
          student.student_name,
          student.roll_number,
          student.email,
          result.rows[0].category_id,
          "VERIFICATION_REQUEST",
          adminEmail ?? null,
        ],
      );
    }
  }

  return requestRow;
};
