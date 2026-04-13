import {
  createRecord,
  findAllCategories,
  findCategoryById,
  findAllRecords,
  findRecordByBitsId,
  findStudentIdentityByEmail,
  markRecordAsVerified,
  softDeleteRecord,
  restoreRecord,
  getCGPABreakdownData,
} from "../repositories/recordsRepository";
import {
  CreateTrainingRecordInput,
  ResolvedTrainingRecordInput,
  TrainingPointCategory,
  TrainingRecord,
  VerificationStatus,
} from "../types";

export const getRecords = async (
  status?: string,
): Promise<TrainingRecord[]> => {
  if (!status) {
    return findAllRecords();
  }

  const normalizedStatus =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  if (
    normalizedStatus !== "Pending" &&
    normalizedStatus !== "Verified" &&
    normalizedStatus !== "Rejected"
  ) {
    throw new Error("Invalid status filter");
  }

  return findAllRecords(normalizedStatus as VerificationStatus);
};

export const getRecordByBitsId = async (
  bitsId: string,
): Promise<TrainingRecord | null> => {
  return findRecordByBitsId(bitsId);
};

export const addRecord = async (
  payload: CreateTrainingRecordInput,
): Promise<TrainingRecord> => {
  let resolvedName = payload.name;
  let resolvedBitsId = payload.bits_id;

  if (!resolvedName || !resolvedBitsId) {
    const student = await findStudentIdentityByEmail(payload.email_id);
    if (!student) {
      throw new Error("Student not found for provided email");
    }

    resolvedName = resolvedName || student.student_name;
    resolvedBitsId = resolvedBitsId || student.roll_number;
  }

  const categoryExists = await findCategoryById(payload.category_id);
  if (!categoryExists) {
    throw new Error("Invalid category_id");
  }

  const resolvedPayload: ResolvedTrainingRecordInput = {
    ...payload,
    name: resolvedName,
    bits_id: resolvedBitsId,
    verification_status: "Verified",
    points: payload.points ?? 0,
  };

  return createRecord(resolvedPayload);
};

export const verifyRecord = async (
  serialNo: number,
  adminEmail?: string,
): Promise<TrainingRecord | null> => {
  return markRecordAsVerified(serialNo, adminEmail);
};

// ─────────────────────────────────────────────────────────────────
// UNDO / DELETE FUNCTIONALITY
// ─────────────────────────────────────────────────────────────────

export const deleteRecord = async (
  serialNo: number,
): Promise<TrainingRecord | null> => {
  return softDeleteRecord(serialNo);
};

export const undoDeleteRecord = async (
  serialNo: number,
): Promise<TrainingRecord | null> => {
  return restoreRecord(serialNo);
};

// ─────────────────────────────────────────────────────────────────
// CGPA BREAKDOWN FUNCTIONALITY
// ─────────────────────────────────────────────────────────────────

export interface CGPABreakdownResponse {
  breakdown: Array<{
    cgpaRange: string;
    averagePoints: number;
    studentCount: number;
  }>;
  studentsWithoutCGPA: string[];
}

export const getCGPABreakdown = async (): Promise<CGPABreakdownResponse> => {
  const data = await getCGPABreakdownData();

  if (data.studentsWithoutCGPA.length > 0) {
    throw new Error(
      `${data.studentsWithoutCGPA.map((name) => `"${name}"`).join(", ")} student${data.studentsWithoutCGPA.length > 1 ? "s" : ""} doesn't have CGPA record`,
    );
  }

  return { breakdown: data.breakdown, studentsWithoutCGPA: [] };
};

// ─────────────────────────────────────────────────────────────────
// BULK OPERATIONS
// ─────────────────────────────────────────────────────────────────

export interface BulkAddInput {
  emails: string[];
  category_id: number;
  points: number;
  added_by: string;
  awarded_by?: string;
}

export interface BulkAddResult {
  success: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
  records: TrainingRecord[];
}

export const bulkAddRecords = async (
  input: BulkAddInput,
): Promise<BulkAddResult> => {
  const { emails, category_id, points, added_by, awarded_by } = input;

  const categoryExists = await findCategoryById(category_id);
  if (!categoryExists) {
    throw new Error("Invalid category_id");
  }

  const errors: Array<{ email: string; error: string }> = [];
  const records: TrainingRecord[] = [];

  for (const email of emails) {
    try {
      // Look up student
      const student = await findStudentIdentityByEmail(email);
      if (!student) {
        errors.push({ email, error: "Student not found" });
        continue;
      }

      // Create record with auto-verified status
      const payload: ResolvedTrainingRecordInput = {
        name: student.student_name,
        bits_id: student.roll_number,
        email_id: email,
        date: new Date().toISOString().split("T")[0], // Today's date
        category_id,
        added_by,
        awarded_by,
        verification_status: "Verified", // Auto-verified for admin bulk additions
        points,
      };

      const record = await createRecord(payload);
      records.push(record);
    } catch (error: any) {
      errors.push({
        email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    success: records.length,
    failed: errors.length,
    errors,
    records,
  };
};

export const getCategories = async (): Promise<TrainingPointCategory[]> => {
  return findAllCategories();
};
