import {
  createRecord,
  findAllRecords,
  findRecordByBitsId,
  markRecordAsVerified,
} from '../repositories/recordsRepository';
import {
  CreateTrainingRecordInput,
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
  return createRecord(payload);
};

export const verifyRecord = async (
  serialNo: number,
): Promise<TrainingRecord | null> => {
  return markRecordAsVerified(serialNo);
};
