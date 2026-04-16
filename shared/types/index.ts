export interface Record {
  s_no: number;
  name: string;
  bits_id: string;
  email_id: string;
  date: string;
  category_id: number;
  category: string;
  added_by: string;
  verification_status: "Pending" | "Verified" | "Rejected";
  points?: number;
  awarded_by?: string | null;
}

export interface VerificationRequest {
  request_id: number;
  student_id: number;
  student_email?: string;
  student_bits_id?: string;
  student_name?: string;
  category_id: number;
  category: string;
  description?: string;
  proof_links: string[];
  status: "Pending" | "Verified" | "Rejected";
  awarded_points?: number | null;
  rejection_reason?: string | null;
  awarded_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVerificationRequestPayload {
  student_name: string;
  student_email: string;
  proof_link: string;
}

export interface TrainingCategory {
  category_id: number;
  category_name: string;
  description?: string | null;
  max_points: number;
}

export interface CreateRecordPayload {
  email_id: string;
  date: string;
  category_id: number;
  added_by: string;
  name?: string;
  bits_id?: string;
  points?: number;
}

export interface RecordsContextType {
  records: Record[];
  verificationRequests: VerificationRequest[];
  categories: TrainingCategory[];
  handleVerify: (sNo: number) => Promise<void>;
  handleCreateRecord: (record: CreateRecordPayload) => Promise<void>;
  handleCreateVerificationRequest: (
    request: CreateVerificationRequestPayload,
  ) => Promise<void>;
  handleVerifyRequest: (requestId: number, points: number) => Promise<void>;
  handleRejectRequest: (
    requestId: number,
    rejectionReason: string,
  ) => Promise<void>;
  handleDeleteRecord: (sNo: number) => Promise<void>;
  handleUndoDelete: (sNo: number) => Promise<void>;
  handleRefreshRecords: () => Promise<void>;
}
