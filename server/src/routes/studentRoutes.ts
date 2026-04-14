import { Router } from "express";
import multer from "multer";
import { bulkUploadStudentsHandler } from "../controllers/studentController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Configure multer for file uploads (keep in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.use(authenticate);

/**
 * POST /students/bulk-upload
 * Admin-only endpoint to bulk upload students via CSV file
 * Expects multipart/form-data with a 'file' field containing the CSV
 */
router.post(
  "/bulk-upload",
  authorize(["admin"]),
  upload.single("file"),
  bulkUploadStudentsHandler,
);

export default router;
