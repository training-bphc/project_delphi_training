import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import pool              from '../config/db';
import { signToken }     from '../config/jwt';
import { asyncHandler }  from '../utils/asyncHandler';
import { Student, Admin } from '../types';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const ELIGIBILITY_DOMAIN  = '@hyderabad.bits-pilani.ac.in';
const MAX_STUDENT_YEARS   = 5;

/**
 * Returns true if the student's email domain is correct and their
 * start_year falls within the active enrolment window.
 */
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

    // ── Input validation ────────────────────────────────────────────────────
    if (!id_token || !role) {
      res.status(400).json({ success: false, message: 'id_token and role are required' });
      return;
    }
    if (role !== 'student' && role !== 'admin') {
      res.status(400).json({ success: false, message: 'role must be "student" or "admin"' });
      return;
    }

    // ── Verify Google token ─────────────────────────────────────────────────
    // verifyIdToken throws if the token is invalid. asyncHandler forwards the
    // thrown error to next(err) → global error handler → 500 response.
    const ticket = await googleClient.verifyIdToken({
      idToken:  id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      res.status(400).json({ success: false, message: 'Invalid Google token payload' });
      return;
    }

    const email = payload.email;

    // ── Admin path ──────────────────────────────────────────────────────────
    if (role === 'admin') {
      const result = await pool.query<Admin>(
        'SELECT * FROM admins WHERE email = $1',
        [email]
      );
      const user = result.rows[0];

      if (!user) {
        res.status(403).json({ success: false, message: 'Unauthorized: not a registered admin' });
        return;
      }

      // Use email as the JWT identity for admins — more meaningful than admin_id
      const token = signToken(user.email, user.email, 'admin');
      console.log(`[AUTH] Admin authenticated: ${email}`);

      res.json({
        success: true,
        token,
        user: {
          admin_name: user.admin_name,
          email:      user.email,
          // admin_id intentionally omitted — internal surrogate key
        },
      });
      return;
    }

    // ── Student path ────────────────────────────────────────────────────────
    // Check domain BEFORE hitting the DB to avoid unnecessary queries.
    if (!email.endsWith(ELIGIBILITY_DOMAIN)) {
      res.status(403).json({ success: false, message: 'Unauthorized: invalid email domain' });
      return;
    }

    const result = await pool.query<Student>(
      'SELECT * FROM students WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      res.status(403).json({ success: false, message: 'Unauthorized: not a registered student' });
      return;
    }

    if (!isEligibleStudent(email, user.start_year)) {
      res.status(403).json({ success: false, message: 'Unauthorized: does not meet eligibility criteria' });
      return;
    }

    // Use roll_number as the JWT identity — the real student identifier.
    const token = signToken(user.roll_number, user.email, 'student');
    console.log(`[AUTH] Student authenticated: ${email}`);

    res.json({
      success: true,
      token,
      user: {
        roll_number:  user.roll_number,
        student_name: user.student_name,
        email:        user.email,
        start_year:   user.start_year,
        end_year:     user.end_year,
        // student_id intentionally omitted — internal surrogate key
      },
    });
  }
);
