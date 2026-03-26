import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import pool from "../config/db";
import { signToken } from "../config/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { Student, Admin } from "../types";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const ELIGIBILITY_DOMAIN = "@hyderabad.bits-pilani.ac.in";
const MAX_STUDENT_YEARS = 5;

const getGoogleTokenErrorMessage = (error: unknown): string => {
  const rawMessage = error instanceof Error ? error.message : "Google token verification failed";
  const message = rawMessage.toLowerCase();

  if (
    message.includes("token used too late") ||
    message.includes("jwt expired") ||
    message.includes("expired")
  ) {
    return "Google sign-in token expired. Please sign in again.";
  }

  if (
    message.includes("wrong recipient") ||
    message.includes("audience") ||
    message.includes("issued to a different client")
  ) {
    return "Google token audience mismatch. Check GOOGLE_CLIENT_ID configuration.";
  }

  return "Google sign-in token is invalid. Please try signing in again.";
};

const isEligibleStudent = (email: string, startYear: number): boolean => {
  const currentYear = new Date().getFullYear();
  return (
    email.endsWith(ELIGIBILITY_DOMAIN) &&
    startYear <= currentYear &&
    startYear >= currentYear - MAX_STUDENT_YEARS
  );
};

export const googleAuth = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { id_token, role } = req.body as { id_token?: string; role?: string };

    if (!id_token || !role) {
      res
        .status(400)
        .json({ success: false, message: "id_token and role are required" });
      return;
    }

    if (role !== "student" && role !== "admin") {
      res
        .status(400)
        .json({ success: false, message: 'role must be "student" or "admin"' });
      return;
    }

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: getGoogleTokenErrorMessage(error),
      });
      return;
    }

    const payload = ticket.getPayload();
    if (!payload?.email) {
      res
        .status(400)
        .json({ success: false, message: "Invalid Google token payload" });
      return;
    }

    const email = payload.email;

    if (role === "admin") {
      const result = await pool.query<Admin>(
        "SELECT * FROM admins WHERE LOWER(email) = LOWER($1)",
        [email],
      );

      const user = result.rows[0];
      if (!user) {
        res
          .status(403)
          .json({
            success: false,
            message: "Unauthorized: not a registered admin",
          });
        return;
      }

      const token = signToken(user.email, user.email, "admin");
      res.json({
        success: true,
        token,
        user: {
          admin_name: user.admin_name,
          email: user.email,
        },
      });
      return;
    }

    if (!email.endsWith(ELIGIBILITY_DOMAIN)) {
      res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized: invalid email domain",
        });
      return;
    }

    const result = await pool.query<Student>(
      "SELECT * FROM students WHERE LOWER(email) = LOWER($1)",
      [email],
    );

    const user = result.rows[0];
    if (!user) {
      res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized: not a registered student",
        });
      return;
    }

    if (!isEligibleStudent(email, user.start_year)) {
      res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized: does not meet eligibility criteria",
        });
      return;
    }

    const token = signToken(user.roll_number, user.email, "student");
    res.json({
      success: true,
      token,
      user: {
        roll_number: user.roll_number,
        student_name: user.student_name,
        email: user.email,
        start_year: user.start_year,
        end_year: user.end_year,
      },
    });
  },
);

export const devLogin = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (process.env.NODE_ENV === "production") {
      res
        .status(403)
        .json({
          success: false,
          message: "dev-login is disabled in production",
        });
      return;
    }

    const { email, role } = req.body as { email?: string; role?: string };

    if (!email || !role) {
      res
        .status(400)
        .json({ success: false, message: "email and role are required" });
      return;
    }

    if (role !== "student" && role !== "admin") {
      res
        .status(400)
        .json({ success: false, message: 'role must be "student" or "admin"' });
      return;
    }

    if (role === "admin") {
      const result = await pool.query<Admin>(
        "SELECT * FROM admins WHERE LOWER(email) = LOWER($1)",
        [email],
      );

      const user = result.rows[0];
      if (!user) {
        res
          .status(403)
          .json({
            success: false,
            message: "Unauthorized: not a registered admin",
          });
        return;
      }

      const token = signToken(user.email, user.email, "admin");
      res.json({
        success: true,
        token,
        user: {
          admin_name: user.admin_name,
          email: user.email,
        },
      });
      return;
    }

    if (!email.endsWith(ELIGIBILITY_DOMAIN)) {
      res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized: invalid email domain",
        });
      return;
    }

    const result = await pool.query<Student>(
      "SELECT * FROM students WHERE LOWER(email) = LOWER($1)",
      [email],
    );

    const user = result.rows[0];
    if (!user) {
      res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized: not a registered student",
        });
      return;
    }

    if (!isEligibleStudent(email, user.start_year)) {
      res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized: does not meet eligibility criteria",
        });
      return;
    }

    const token = signToken(user.roll_number, user.email, "student");
    res.json({
      success: true,
      token,
      user: {
        roll_number: user.roll_number,
        student_name: user.student_name,
        email: user.email,
        start_year: user.start_year,
        end_year: user.end_year,
      },
    });
  },
);
