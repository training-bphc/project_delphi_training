import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  addRecord,
  getCategories,
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
      Number.isInteger(body.category_id),
  );
};

export const getCategoriesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await getCategories();
  res.status(200).json({ success: true, data: categories });
});

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
  const body = req.body as Partial<CreateTrainingRecordInput>;
  const payload: CreateTrainingRecordInput = {
    email_id: body.email_id ?? '',
    date: body.date ?? '',
    category_id: Number(body.category_id),
    added_by: req.user?.email ?? '',
    awarded_by: req.user?.role === 'admin' ? req.user.email : undefined,
    name: body.name,
    bits_id: body.bits_id,
    verification_status: body.verification_status,
    points: body.points,
  };

  console.log('[RECORDS] Incoming create request:', {
    email_id: payload.email_id,
    date: payload.date,
    category_id: payload.category_id,
    points: payload.points,
    added_by: payload.added_by,
    awarded_by: payload.awarded_by,
  });

  if (!payload.added_by) {
    res.status(401).json({ success: false, message: 'Authenticated user email not found' });
    return;
  }

  if (!hasRequiredFields(payload)) {
    res.status(400).json({ success: false, message: 'Missing required record fields' });
    return;
  }

  if (!Number.isInteger(payload.category_id) || payload.category_id <= 0) {
    res.status(400).json({ success: false, message: 'category_id must be a positive integer' });
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

    if (error instanceof Error && error.message === 'Invalid category_id') {
      res.status(400).json({ success: false, message: error.message });
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

  const updatedRecord = await verifyRecord(serialNo, req.user?.email);

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
  const payload = req.body as { emails?: string[]; category_id?: number; points?: number; added_by?: string };

  if (!payload.emails || !Array.isArray(payload.emails) || payload.emails.length === 0) {
    res.status(400).json({ success: false, message: 'emails must be a non-empty array' });
    return;
  }

  if (!Number.isInteger(payload.category_id) || Number(payload.category_id) <= 0) {
    res.status(400).json({ success: false, message: 'category_id is required and must be a positive integer' });
    return;
  }

  if (payload.points === undefined || !Number.isFinite(payload.points) || payload.points < 0) {
    res.status(400).json({ success: false, message: 'points must be a non-negative number' });
    return;
  }

  const actorEmail = req.user?.email;
  if (!actorEmail) {
    res.status(401).json({ success: false, message: 'Authenticated user email not found' });
    return;
  }

  const bulkInput: BulkAddInput = {
    emails: payload.emails,
    category_id: Number(payload.category_id),
    points: payload.points,
    added_by: actorEmail,
    awarded_by: req.user?.role === 'admin' ? actorEmail : undefined,
  };

  try {
    const result = await bulkAddRecords(bulkInput);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid category_id') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    throw error;
  }
});
