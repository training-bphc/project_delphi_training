import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createVerificationRequest,
  findAllVerificationRequests,
  findVerificationRequestsForStudent,
  findVerificationRequestById,
  updateVerificationRequestStatus,
} from "../repositories/recordsRepository";

const isValidHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const getVerificationRequestsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const normalizedStatus = status
      ? ((status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()) as
          | "Pending"
          | "Verified"
          | "Rejected")
      : undefined;

    try {
      const requests =
        req.user?.role === "student"
          ? await findVerificationRequestsForStudent(
              req.user.email,
              normalizedStatus,
            )
          : await findAllVerificationRequests(normalizedStatus);
      res.status(200).json({ success: true, data: requests });
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid status filter") {
        res.status(400).json({
          success: false,
          message: "status must be pending, verified, or rejected",
        });
        return;
      }
      throw error;
    }
  },
);

export const getVerificationRequestByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const request = await findVerificationRequestById(Number(requestId));

    if (!request) {
      res.status(404).json({ success: false, message: "Request not found" });
      return;
    }

    res.status(200).json({ success: true, data: request });
  },
);

export const createVerificationRequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== "student") {
      res
        .status(403)
        .json({
          success: false,
          message: "Only students can submit verification requests",
        });
      return;
    }

    const { student_name, student_email, proof_link } = req.body as {
      student_name?: string;
      student_email?: string;
      proof_link?: string;
    };

    if (!student_name || !student_email || !proof_link) {
      res
        .status(400)
        .json({
          success: false,
          message: "student_name, student_email and proof_link are required",
        });
      return;
    }

    if (
      !isValidHttpUrl(proof_link) ||
      !proof_link.includes("drive.google.com")
    ) {
      res
        .status(400)
        .json({
          success: false,
          message: "proof_link must be a valid https Google Drive link",
        });
      return;
    }

    try {
      const created = await createVerificationRequest(req.user.email, {
        student_email,
        student_name,
        proof_link,
      });

      res.status(201).json({ success: true, data: created });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Student not found") {
          res.status(404).json({ success: false, message: error.message });
          return;
        }

        if (
          error.message ===
            "Submitted email must match logged-in student email" ||
          error.message ===
            "Submitted name must match logged-in student name" ||
          error.message === "Hackathons/Competitions category not found"
        ) {
          res.status(400).json({ success: false, message: error.message });
          return;
        }
      }

      throw error;
    }
  },
);

export const verifyRequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const requestId = Number(req.params.requestId);
    const { points } = req.body as { points?: number };

    if (!Number.isInteger(requestId) || requestId <= 0) {
      res.status(400).json({ success: false, message: "Invalid request ID" });
      return;
    }

    if (!Number.isInteger(points) || (points ?? -1) < 0) {
      res.status(400).json({
        success: false,
        message: "points must be a non-negative integer",
      });
      return;
    }

    let updatedRequest;
    try {
      updatedRequest = await updateVerificationRequestStatus(
        requestId,
        "Verified",
        req.user?.email,
        undefined,
        points,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("Assigned points exceed limit") ||
          error.message.includes("exceed category limit") ||
          error.message.includes("awarded_points must be a non-negative integer") ||
          error.message.includes("not found"))
      ) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }

      throw error;
    }

    if (!updatedRequest) {
      res.status(404).json({ success: false, message: "Request not found" });
      return;
    }

    res.status(200).json({ success: true, data: updatedRequest });
  },
);

export const rejectRequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const requestId = Number(req.params.requestId);
    const { rejection_reason } = req.body as { rejection_reason?: string };

    if (!Number.isInteger(requestId) || requestId <= 0) {
      res.status(400).json({ success: false, message: "Invalid request ID" });
      return;
    }

    if (!rejection_reason || !rejection_reason.trim()) {
      res
        .status(400)
        .json({ success: false, message: "rejection_reason is required" });
      return;
    }

    const updatedRequest = await updateVerificationRequestStatus(
      requestId,
      "Rejected",
      req.user?.email,
      rejection_reason.trim(),
    );

    if (!updatedRequest) {
      res.status(404).json({ success: false, message: "Request not found" });
      return;
    }

    res.status(200).json({ success: true, data: updatedRequest });
  },
);
