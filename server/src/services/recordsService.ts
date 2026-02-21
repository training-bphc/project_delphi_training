import {
  createRecord,
  findAllRecords,
  findRecordIdentityByEmail,
  findRecordByBitsId,
  findStudentIdentityByEmail,
  markRecordAsVerified,
} from '../repositories/recordsRepository';
import {
  CreateTrainingRecordInput,
  ResolvedTrainingRecordInput,
  TrainingRecord,
  VerificationStatus,
} from '../types';

export const getRecords = async (
  status?: string,
): Promise<TrainingRecord[]> => {
  if (!status) {
    return findAllRecords();
  }

  const normalizedStatus =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  if (
    normalizedStatus !== 'Pending' &&
    normalizedStatus !== 'Verified' &&
    normalizedStatus !== 'Rejected'
  ) {
    throw new Error('Invalid status filter');
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
  console.log('[SERVICE] addRecord called with points:', payload.points);

  let resolvedName = payload.name;
  let resolvedBitsId = payload.bits_id;

  if (!resolvedName || !resolvedBitsId) {
    console.log('[SERVICE] No name/bits_id provided, looking up by email:', payload.email_id);

    const student = await findStudentIdentityByEmail(payload.email_id);
    if (!student) {
      console.log('[SERVICE] Student NOT found in students table. Throwing error.');
      throw new Error('Student not found for provided email');
    }

    console.log('[SERVICE] Found student in students table:', {
      student_name: student.student_name,
      roll_number: student.roll_number,
    });
    resolvedName = resolvedName || student.student_name;
    resolvedBitsId = resolvedBitsId || student.roll_number;
  }

  const resolvedPayload: ResolvedTrainingRecordInput = {
    ...payload,
    name: resolvedName,
    bits_id: resolvedBitsId,
    verification_status: payload.verification_status ?? 'Pending',
    points: payload.points ?? 0,
  };

  console.log('[SERVICE] Final payload being saved: points =', resolvedPayload.points);

  return createRecord(resolvedPayload);
};

export const verifyRecord = async (
  serialNo: number,
): Promise<TrainingRecord | null> => {
  return markRecordAsVerified(serialNo);
};
