import { Router } from 'express';
import {
  createRecordHandler,
  getRecordByBitsIdHandler,
  getRecordsHandler,
  verifyRecordHandler,
  deleteRecordHandler,
  undoDeleteRecordHandler,
  bulkAddRecordsHandler,
} from '../controllers/recordsController';
import {
  getVerificationRequestsHandler,
  getVerificationRequestByIdHandler,
  verifyRequestHandler,
  rejectRequestHandler,
} from '../controllers/verificationRequestsController';

const router = Router();

// ───────────────────────────────────────────────────────────────────
// TRAINING RECORDS ENDPOINTS
// ───────────────────────────────────────────────────────────────────

router.get('/records', getRecordsHandler);
router.get('/records/by-bits-id/:bitsId', getRecordByBitsIdHandler);
router.post('/records', createRecordHandler);
router.patch('/records/:sNo/verify', verifyRecordHandler);
router.delete('/records/:sNo', deleteRecordHandler);
router.post('/records/:sNo/undo', undoDeleteRecordHandler);
router.post('/records/bulk-add', bulkAddRecordsHandler);

// ───────────────────────────────────────────────────────────────────
// VERIFICATION REQUESTS ENDPOINTS
// ───────────────────────────────────────────────────────────────────

router.get('/verification-requests', getVerificationRequestsHandler);
router.get('/verification-requests/:requestId', getVerificationRequestByIdHandler);
router.patch('/verification-requests/:requestId/verify', verifyRequestHandler);
router.patch('/verification-requests/:requestId/reject', rejectRequestHandler);

export default router;
