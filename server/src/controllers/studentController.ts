import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { bulkInsertStudents } from "../services/studentService";

/**
 * Handler for bulk uploading students via CSV file
 * Expected: multipart/form-data with 'file' field containing CSV
 * CSV format: email,student_name,roll_number,start_year,end_year,cgpa,sector
 */
export const bulkUploadStudentsHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // Check if file is present
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "File is required. Send CSV file in 'file' field as multipart/form-data",
      });
      return;
    }

    // Check if file is CSV
    if (
      !req.file.originalname.endsWith(".csv") &&
      req.file.mimetype !== "text/csv"
    ) {
      res.status(400).json({
        success: false,
        message: "File must be a CSV file",
      });
      return;
    }

    // Extract CSV content from buffer
    let csvContent: string;
    try {
      csvContent = req.file.buffer.toString("utf-8");
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Failed to read file content",
      });
      return;
    }

    // Validate that CSV content is not empty
    if (!csvContent.trim()) {
      res.status(400).json({
        success: false,
        message: "CSV file is empty",
      });
      return;
    }

    // Process the bulk insert
    try {
      const result = await bulkInsertStudents(csvContent);

      // Return 422 when nothing was inserted (parse/validation/CSV-level failure)
      const isFullFailure = result.success === 0 && result.errors.length > 0;

      const students = result.students.map(({ student_id: _id, ...rest }) => rest);

      res.status(isFullFailure ? 422 : 201).json({
        success: !isFullFailure,
        message: `Bulk upload completed. ${result.success} students added, ${result.failed} failed.`,
        data: {
          summary: {
            total_processed: result.success + result.failed,
            successful: result.success,
            failed: result.failed,
          },
          students,
          errors: result.errors,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Bulk upload processing failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);
