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
    hs.awarded_points,
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
      SELECT category_id, category_name, description, max_points
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
      SELECT category_id, category_name, description, max_points
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
  awardedPoints?: number,
): Promise<VerificationRequest | null> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const requestLookup = await client.query<{
      student_id: number;
      category_id: number;
      status: RequestStatus;
    }>(
      `
        SELECT student_id, category_id, status
        FROM hackathon_submissions
        WHERE request_id = $1
        LIMIT 1
      `,
      [requestId],
    );

    const requestContext = requestLookup.rows[0];
    if (!requestContext) {
      await client.query("ROLLBACK");
      return null;
    }

    if (newStatus === "Rejected") {
      await client.query(
        `
          UPDATE hackathon_submissions
          SET status = 'Rejected',
              awarded_points = 0,
              rejection_reason = $2::text,
              updated_at = CURRENT_TIMESTAMP
          WHERE request_id = $1
        `,
        [requestId, rejectionReason ?? null],
      );
    } else if (newStatus === "Verified") {
      if (!Number.isInteger(awardedPoints) || (awardedPoints ?? 0) < 0) {
        throw new Error("awarded_points must be a non-negative integer");
      }

      const studentResult = await client.query<{
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
        [requestContext.student_id],
      );

      const student = studentResult.rows[0];
      if (!student) {
        throw new Error("Student not found for verification request");
      }

      const categoryResult = await client.query<{ max_points: number }>(
        `
          SELECT max_points
          FROM training_point_categories
          WHERE category_id = $1
          LIMIT 1
        `,
        [requestContext.category_id],
      );

      const category = categoryResult.rows[0];
      if (!category) {
        throw new Error("Category not found for verification request");
      }

      const currentTotalResult = await client.query<{ total: number }>(
        `
          SELECT COALESCE(SUM(points), 0)::int AS total
          FROM training_points
          WHERE bits_id = $1
            AND category_id = $2
            AND verification_status = 'Verified'
            AND deleted_at IS NULL
        `,
        [student.roll_number, requestContext.category_id],
      );

      const currentTotal = currentTotalResult.rows[0]?.total ?? 0;
      const remaining = Math.max(0, category.max_points - currentTotal);

      if ((awardedPoints ?? 0) > remaining) {
        throw new Error(
          `Assigned points exceed limit. Allowed range: 0-${remaining}`,
        );
      }

      await client.query(
        `
          UPDATE hackathon_submissions
          SET status = 'Verified',
              awarded_points = $2,
              rejection_reason = NULL,
              updated_at = CURRENT_TIMESTAMP,
              awarded_by = COALESCE($3::text, awarded_by)
          WHERE request_id = $1
        `,
        [requestId, awardedPoints ?? 0, adminEmail ?? null],
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
          ) VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, 'Verified', $6, $7)
        `,
        [
          student.student_name,
          student.roll_number,
          student.email,
          requestContext.category_id,
          "VERIFICATION_REQUEST",
          awardedPoints ?? 0,
          adminEmail ?? null,
        ],
      );
    } else {
      await client.query(
        `
          UPDATE hackathon_submissions
          SET status = $2::text,
              awarded_points = NULL,
              rejection_reason = NULL,
              updated_at = CURRENT_TIMESTAMP
          WHERE request_id = $1
        `,
        [requestId, newStatus],
      );
    }

    const finalRequest = await client.query<VerificationRequest>(
      `${REQUEST_SELECT}
       WHERE hs.request_id = $1`,
      [requestId],
    );

    await client.query("COMMIT");
    return finalRequest.rows[0] ?? null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getCGPABreakdownData = async (): Promise<{
  breakdown: Array<{
    cgpaRange: string;
    averagePoints: number;
    studentCount: number;
  }>;
  studentsWithoutCGPA: string[];
}> => {
  const result = await pool.query<{
    student_name: string;
    cgpa: number | null;
    average_points: string;
  }>(
    `
      SELECT
        s.student_name,
        s.cgpa,
        COALESCE(AVG(tp.points), 0)::numeric AS average_points
      FROM students s
      LEFT JOIN training_points tp ON s.roll_number = tp.bits_id
        AND tp.deleted_at IS NULL
      GROUP BY s.student_id, s.student_name, s.cgpa
      ORDER BY s.student_name ASC
    `,
  );

  const students = result.rows;
  const studentsWithoutCGPA: string[] = [];
  const cgpaRanges = {
    "9-10": { min: 9.0, max: 10.0, totalPoints: 0, count: 0 },
    "8-9": { min: 8.0, max: 9.0, totalPoints: 0, count: 0 },
    "7-8": { min: 7.0, max: 8.0, totalPoints: 0, count: 0 },
    "6-7": { min: 6.0, max: 7.0, totalPoints: 0, count: 0 },
    "<6": { min: Number.NEGATIVE_INFINITY, max: 6.0, totalPoints: 0, count: 0 },
  };

  for (const student of students) {
    if (student.cgpa === null) {
      studentsWithoutCGPA.push(student.student_name);
      continue;
    }

    const cgpa = Number(student.cgpa);
    const avgPoints = Number(student.average_points);

    if (cgpa >= 9 && cgpa <= 10) {
      cgpaRanges["9-10"].count += 1;
      cgpaRanges["9-10"].totalPoints += avgPoints;
    } else if (cgpa >= 8 && cgpa < 9) {
      cgpaRanges["8-9"].count += 1;
      cgpaRanges["8-9"].totalPoints += avgPoints;
    } else if (cgpa >= 7 && cgpa < 8) {
      cgpaRanges["7-8"].count += 1;
      cgpaRanges["7-8"].totalPoints += avgPoints;
    } else if (cgpa >= 6 && cgpa < 7) {
      cgpaRanges["6-7"].count += 1;
      cgpaRanges["6-7"].totalPoints += avgPoints;
    } else {
      cgpaRanges["<6"].count += 1;
      cgpaRanges["<6"].totalPoints += avgPoints;
    }
  }

  const breakdown = ["9-10", "8-9", "7-8", "6-7", "<6"].map((range) => {
    const item = cgpaRanges[range as keyof typeof cgpaRanges];
    return {
      cgpaRange: range,
      averagePoints:
        item.count > 0 ? Number((item.totalPoints / item.count).toFixed(2)) : 0,
      studentCount: item.count,
    };
  });

  return { breakdown, studentsWithoutCGPA };
};
