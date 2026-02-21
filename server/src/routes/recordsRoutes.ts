import { Router } from 'express';
import {
  createRecordHandler,
  getRecordByBitsIdHandler,
  getRecordsHandler,
  verifyRecordHandler,
} from '../controllers/recordsController';

const router = Router();

router.get('/records', getRecordsHandler);
router.get('/records/by-bits-id/:bitsId', getRecordByBitsIdHandler);
router.post('/records', createRecordHandler);
router.patch('/records/:sNo/verify', verifyRecordHandler);

export default router;
