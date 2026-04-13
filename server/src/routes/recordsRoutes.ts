import { Router } from "express";
import {
  createRecordHandler,
  getCategoriesHandler,
  getRecordByBitsIdHandler,
  getRecordsHandler,
  verifyRecordHandler,
  deleteRecordHandler,
  undoDeleteRecordHandler,
  bulkAddRecordsHandler,
  getCGPABreakdownHandler,
} from "../controllers/recordsController";
import {
  createVerificationRequestHandler,
  getVerificationRequestsHandler,
  getVerificationRequestByIdHandler,
  verifyRequestHandler,
  rejectRequestHandler,
} from "../controllers/verificationRequestsController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

// ───────────────────────────────────────────────────────────────────
// TRAINING RECORDS ENDPOINTS
// ───────────────────────────────────────────────────────────────────

router.get("/categories", getCategoriesHandler);
router.get("/records", getRecordsHandler);
router.get("/records/by-bits-id/:bitsId", getRecordByBitsIdHandler);
router.get(
  "/records/cgpa-breakdown",
  authorize(["admin"]),
  getCGPABreakdownHandler,
);
router.post("/records", createRecordHandler);
router.patch("/records/:sNo/verify", authorize(["admin"]), verifyRecordHandler);
router.delete("/records/:sNo", authorize(["admin"]), deleteRecordHandler);
router.post(
  "/records/:sNo/undo",
  authorize(["admin"]),
  undoDeleteRecordHandler,
);
router.post("/records/bulk-add", authorize(["admin"]), bulkAddRecordsHandler);

// ───────────────────────────────────────────────────────────────────
// VERIFICATION REQUESTS ENDPOINTS
// ───────────────────────────────────────────────────────────────────

router.get(
  "/verification-requests",
  authorize(["admin", "student"]),
  getVerificationRequestsHandler,
);
router.post(
  "/verification-requests",
  authorize(["student"]),
  createVerificationRequestHandler,
);
router.get(
  "/verification-requests/:requestId",
  authorize(["admin"]),
  getVerificationRequestByIdHandler,
);
router.patch(
  "/verification-requests/:requestId/verify",
  authorize(["admin"]),
  verifyRequestHandler,
);
router.patch(
  "/verification-requests/:requestId/reject",
  authorize(["admin"]),
  rejectRequestHandler,
);

export default router;
