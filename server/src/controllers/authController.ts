import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import pool from '../config/db';
import { signToken } from '../config/jwt';
import { asyncHandler } from '../utils/asyncHandler';

const ELIGIBILITY_DOMAIN = '@hyderabad.bits-pilani.ac.in';
const ADMIN_EMAIL = 'training@hyderabad.bits-pilani.ac.in';

/**
 * Extract student info from email
 * Email format: f20231100@hyderabad.bits-pilani.ac.in
 */
const extractStudentInfo = (email: string) => {
  const [prefix] = email.split('@');
  const rollNumber = prefix;
  const studentName = prefix;
  
  return { rollNumber, studentName };
};

/**
 * Get or create batch for student
 */
const getOrCreateBatch = async (startYear: number) => {
  const endYear = startYear + 4;
  
  const result = await pool.query(
    'SELECT batch_id FROM batches WHERE start_year = $1 AND end_year = $2',
    [startYear, endYear]
  );

  if (result.rows[0]) {
    return result.rows[0].batch_id;
  }

  const batchName = `${startYear}-${endYear} Batch`;
  const insertResult = await pool.query(
    'INSERT INTO batches (batch_name, start_year, end_year) VALUES ($1, $2, $3) RETURNING batch_id',
    [batchName, startYear, endYear]
  );

  return insertResult.rows[0].batch_id;
};

/**
 * Add student to students table
 */
const addStudentToDatabase = async (email: string, rollNumber: string, studentName: string, startYear: number) => {
  try {
    const batchId = await getOrCreateBatch(startYear);

    const existingStudent = await pool.query(
      'SELECT * FROM students WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingStudent.rows[0]) {
      console.log(`[AUTH] Student already exists: ${email}`);
      return existingStudent.rows[0];
    }

    const result = await pool.query(
      `INSERT INTO students (email, student_name, roll_number, start_year, end_year, batch_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [email, studentName, rollNumber, startYear, startYear + 4, batchId]
    );

    console.log(`[AUTH] Student added to database: ${email}`);
    return result.rows[0];
  } catch (error) {
    console.error('[AUTH] Error adding student to database:', error);
    throw error;
  }
};

/**
 * Add admin to admins table
 */
const addAdminToDatabase = async (email: string, adminName: string) => {
  try {
    const existingAdmin = await pool.query(
      'SELECT * FROM admins WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingAdmin.rows[0]) {
      console.log(`[AUTH] Admin already exists: ${email}`);
      return existingAdmin.rows[0];
    }

    const result = await pool.query(
      `INSERT INTO admins (email, admin_name, department, permissions, is_super_admin)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email, adminName, 'Training Unit', '{}', true]
    );

    console.log(`[AUTH] Admin added to database: ${email}`);
    return result.rows[0];
  } catch (error) {
    console.error('[AUTH] Error adding admin to database:', error);
    throw error;
  }
};

/**
 * Sign up user with email and password
 * - Students: auto-added to students table
 * - Admin (training@...): auto-added to admins table
 */
export const signUp = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: string;
    };

    // Validation
    if (!email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'email, password, and role are required',
      });
      return;
    }

    if (role !== 'student' && role !== 'admin') {
      res.status(400).json({
        success: false,
        message: 'role must be "student" or "admin"',
      });
      return;
    }

    // ✅ ONLY CHECK: Email domain
    if (!email.endsWith(ELIGIBILITY_DOMAIN)) {
      res.status(403).json({
        success: false,
        message: `Unauthorized: email must be ${ELIGIBILITY_DOMAIN}`,
      });
      return;
    }

    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role },
      });

      if (error || !data.user) {
        console.error('Supabase signup error:', error);
        res.status(400).json({
          success: false,
          message: error?.message || 'Failed to create user',
        });
        return;
      }

      console.log(`[AUTH] User signed up in Supabase: ${email}`);

      // ✅ AUTO-ADD TO DATABASE BASED ON EMAIL
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        // Special case: training@... is automatically an admin
        const adminName = 'Training Unit Admin';
        await addAdminToDatabase(email, adminName);
        console.log(`[AUTH] Admin automatically added to admins table: ${email}`);
      } else if (role === 'student') {
        // Regular student signup
        const { rollNumber, studentName } = extractStudentInfo(email);
        const startYear = parseInt(rollNumber.substring(1, 5));
        await addStudentToDatabase(email, rollNumber, studentName, startYear);
        console.log(`[AUTH] Student automatically added to students table: ${email}`);
      }

      res.json({
        success: true,
        message: 'Sign up successful. Please log in.',
      });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }
);

/**
 * Login with email and password
 */
export const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: string;
    };

    // Validation
    if (!email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'email, password, and role are required',
      });
      return;
    }

    if (role !== 'student' && role !== 'admin') {
      res.status(400).json({
        success: false,
        message: 'role must be "student" or "admin"',
      });
      return;
    }

    // ✅ ONLY CHECK: Email domain
    if (!email.endsWith(ELIGIBILITY_DOMAIN)) {
      res.status(403).json({
        success: false,
        message: `Unauthorized: email must be ${ELIGIBILITY_DOMAIN}`,
      });
      return;
    }

    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        console.error('[AUTH] Supabase login error:', error);
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Create JWT token
      const token = signToken(email, email, role);
      console.log(`[AUTH] User authenticated: ${email} as ${role}`);

      res.json({
        success: true,
        token,
        user: {
          email,
          role,
          name: email.split('@')[0],
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
);

/**
 * Magic Link Login (Optional - Email based)
 */
export const magicLink = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { email } = req.body as { email?: string };

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'email is required',
      });
      return;
    }

    if (!email.endsWith(ELIGIBILITY_DOMAIN)) {
      res.status(403).json({
        success: false,
        message: `Unauthorized: email must be ${ELIGIBILITY_DOMAIN}`,
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) {
        console.error('[AUTH] Magic link error:', error);
        res.status(400).json({
          success: false,
          message: error.message || 'Failed to send magic link',
        });
        return;
      }

      console.log(`[AUTH] Magic link sent to: ${email}`);
      res.json({
        success: true,
        message: 'Check your email for login link',
      });
    } catch (error) {
      console.error('Magic link error:', error);
      throw error;
    }
  }
);