import type { Student } from "@/shared/types/index";

export interface StudentsByBatch {
  [batch: number]: Student[];
}

export interface BulkUploadResult {
  success: boolean;
  message: string;
  data: {
    summary: {
      total_processed: number;
      successful: number;
      failed: number;
    };
    students: Omit<Student, "student_id">[];
    errors: Array<{ row: number; email?: string; error: string }>;
  };
}

/**
 * Fetch students grouped by graduating batch
 */
export const fetchStudentsByBatch = async (
  token: string,
): Promise<StudentsByBatch> => {
  const response = await fetch("/api/students/by-batch", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch students by batch: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || {};
};

/**
 * Upload students in bulk via CSV file
 */
export const bulkUploadStudents = async (
  file: File,
  token: string,
): Promise<BulkUploadResult> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/students/bulk-upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to upload students");
  }

  return data;
};