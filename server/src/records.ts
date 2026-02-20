// Backend logic for records management
// This file contains functions for filtering, updating, and managing records

export type Record = {
  S_no: number;
  name: string;
  bits_id: string;
  email_id: string;
  date: string;
  category: string;
  added_by: string;
  verification_status: string;
  points: number;
};

// Filter records by status
export function getPendingRecords(records: Record[]): Record[] {
  return records.filter((r) => r.verification_status === "Pending");
}

export function getVerifiedRecords(records: Record[]): Record[] {
  return records.filter((r) => r.verification_status === "Verified");
}

// Move record to verified and increment points
export function verifyRecord(records: Record[], S_no: number): Record[] {
  return records.map((r) =>
    r.S_no === S_no
      ? { ...r, verification_status: "Verified", points: (r.points || 0) + 10 }
      : r,
  );
}

// Add new record
export function addRecord(records: Record[], newRecord: Record): Record[] {
  return [...records, newRecord];
}
