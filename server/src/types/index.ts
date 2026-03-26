// USERS

export type UserRole = "student" | "admin";

export interface Student {
  student_id: number; // internal DB surrogate key — do NOT expose in API responses
  roll_number: string; // real student identity e.g. "F20210001"
  student_name: string;
  email: string;
  start_year: number;
  end_year: number;
}

export interface Admin {
  admin_id: number; // internal DB surrogate key
  admin_name: string;
  email: string;
}

// JWT PAYLOAD

export interface JwtPayload {
  id: string; // roll_number for students; email for admins
  email: string;
  role: UserRole;
  iat: number; // issued at (set automatically by jsonwebtoken)
  exp: number; // expiration time (set automatically by jsonwebtoken)
}

export type VerificationStatus = "Pending" | "Verified" | "Rejected";
export type RequestStatus = "Pending" | "Verified" | "Rejected";

export interface TrainingRecord {
  s_no: number;
  name: string;
  bits_id: string;
  email_id: string;
  date: string;
  category_id: number;
  category: string;
  added_by: string;
  verification_status: VerificationStatus;
  points: number;
  awarded_by?: string | null;
  deleted_at?: string | null;
}

export interface VerificationRequest {
  request_id: number;
  student_id: number;
  student_name?: string;
  student_email?: string;
  student_bits_id?: string;
  category_id: number;
  category: string;
  description?: string;
  proof_links: string[];
  status: RequestStatus;
  rejection_reason?: string | null;
  awarded_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVerificationRequestInput {
  student_email: string;
  student_name: string;
  proof_link: string;
}

export interface TrainingPointCategory {
  category_id: number;
  category_name: string;
  description?: string | null;
  max_points: number;
  is_mythology: boolean;
}

export interface CreateTrainingRecordInput {
  email_id: string;
  date: string;
  category_id: number;
  added_by: string;
  awarded_by?: string;
  name?: string;
  bits_id?: string;
  verification_status?: VerificationStatus;
  points?: number;
}

export interface ResolvedTrainingRecordInput {
  name: string;
  bits_id: string;
  email_id: string;
  date: string;
  category_id: number;
  added_by: string;
  awarded_by?: string;
  verification_status?: VerificationStatus;
  points?: number;
}
