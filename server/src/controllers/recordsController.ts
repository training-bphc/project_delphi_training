import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  addRecord,
  getRecordByBitsId,
  getRecords,
  verifyRecord,
  deleteRecord,
  undoDeleteRecord,
  bulkAddRecords,
  BulkAddInput,
} from '../services/recordsService';
import { CreateTrainingRecordInput } from '../types';

const hasRequiredFields = (body: CreateTrainingRecordInput): boolean => {
  return Boolean(
      body.email_id &&
      body.date &&
      body.category &&
      body.added_by,
  );
};

export const getRecordsHandler = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;

  try {
    const records = await getRecords(status);
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid status filter') {
      res.status(400).json({ success: false, message: 'status must be pending, verified, or rejected' });
      return;
    }
    throw error;
  }
});

export const getRecordByBitsIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { bitsId } = req.params;
  const record = await getRecordByBitsId(bitsId);

  if (!record) {
    res.status(404).json({ success: false, message: 'Record not found' });
    return;
  }

  res.status(200).json({ success: true, data: record });
});

export const createRecordHandler = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as CreateTrainingRecordInput;

  console.log('[RECORDS] Incoming create request:', {
    email_id: payload.email_id,
    date: payload.date,
    category: payload.category,
    points: payload.points,
    added_by: payload.added_by,
  });

  if (!hasRequiredFields(payload)) {
    res.status(400).json({ success: false, message: 'Missing required record fields' });
    return;
  }

  if (payload.points !== undefined && (!Number.isFinite(payload.points) || payload.points < 0)) {
    res.status(400).json({ success: false, message: 'points must be a non-negative number' });
    return;
  }

  try {
    const record = await addRecord(payload);
    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    if (error instanceof Error && error.message === 'Student not found for provided email') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }

    if (error?.code === '23505') {
      res.status(409).json({ success: false, message: 'Duplicate record violates unique constraints' });
      return;
    }

    throw error;
  }
});

export const verifyRecordHandler = asyncHandler(async (req: Request, res: Response) => {
  const serialNo = Number(req.params.sNo);

  if (!Number.isInteger(serialNo) || serialNo <= 0) {
    res.status(400).json({ success: false, message: 'Invalid record serial number' });
    return;
  }

  const updatedRecord = await verifyRecord(serialNo);

  if (!updatedRecord) {
    res.status(404).json({ success: false, message: 'Record not found' });
    return;
  }

  res.status(200).json({ success: true, data: updatedRecord });
});

// ─────────────────────────────────────────────────────────────────
// DELETE / UNDO HANDLERS
// ─────────────────────────────────────────────────────────────────

export const deleteRecordHandler = asyncHandler(async (req: Request, res: Response) => {
  const serialNo = Number(req.params.sNo);

  if (!Number.isInteger(serialNo) || serialNo <= 0) {
    res.status(400).json({ success: false, message: 'Invalid record serial number' });
    return;
  }

  const deletedRecord = await deleteRecord(serialNo);

  if (!deletedRecord) {
    res.status(404).json({ success: false, message: 'Record not found' });
    return;
  }

  res.status(200).json({ success: true, message: 'Record deleted', data: deletedRecord });
});

export const undoDeleteRecordHandler = asyncHandler(async (req: Request, res: Response) => {
  const serialNo = Number(req.params.sNo);

  if (!Number.isInteger(serialNo) || serialNo <= 0) {
    res.status(400).json({ success: false, message: 'Invalid record serial number' });
    return;
  }

  const restoredRecord = await undoDeleteRecord(serialNo);

  if (!restoredRecord) {
    res.status(404).json({ success: false, message: 'Record not found' });
    return;
  }

  res.status(200).json({ success: true, message: 'Record restored', data: restoredRecord });
});

// ─────────────────────────────────────────────────────────────────
// BULK UPLOAD HANDLERS
// ─────────────────────────────────────────────────────────────────

export const bulkAddRecordsHandler = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as { emails?: string[]; category?: string; points?: number; added_by?: string };

  if (!payload.emails || !Array.isArray(payload.emails) || payload.emails.length === 0) {
    res.status(400).json({ success: false, message: 'emails must be a non-empty array' });
    return;
  }

  if (!payload.category || typeof payload.category !== 'string') {
    res.status(400).json({ success: false, message: 'category is required and must be a string' });
    return;
  }

  if (payload.points === undefined || !Number.isFinite(payload.points) || payload.points < 0) {
    res.status(400).json({ success: false, message: 'points must be a non-negative number' });
    return;
  }

  if (!payload.added_by || typeof payload.added_by !== 'string') {
    res.status(400).json({ success: false, message: 'added_by is required' });
    return;
  }

  const bulkInput: BulkAddInput = {
    emails: payload.emails,
    category: payload.category,
    points: payload.points,
    added_by: payload.added_by,
  };

  const result = await bulkAddRecords(bulkInput);
  res.status(201).json({ success: true, data: result });
});
