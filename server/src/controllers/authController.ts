/*
Auth Controller
- Handles google authentication and user profile retrieval.
*/

import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import pool from '../config/db';
import { signToken } from '../config/jwt';
import { Student, Admin } from '../types';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
    const { id_token, role } = req.body as { id_token: string; role: 'student' | 'admin' };
    if (!id_token || !role) {
        res.status(400).json({ message: 'id_token and role are required' });
        return;
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ message: 'Invalid Google token' });
            return;
        }

        const email = payload.email;
        let user;

        if (role === 'admin') {
            const result = await pool.query<Admin>('SELECT * FROM admins WHERE email = $1', [email]);
            user = result.rows[0];
            if (!user) {
                res.status(403).json({ message: 'Unauthorized admin' });
                return;
            }
            console.log(`[AUTH] Admin authenticated: ${email}`);
            const token = signToken(user.admin_id, user.email, 'admin');
            res.json({
                token,
                user: {
                    admin_id: user.admin_id,
                    admin_name: user.admin_name,
                    email: user.email,
                },
            });
            return;
        } else if (role === 'student') {
            const result = await pool.query<Student>('SELECT * FROM students WHERE email = $1', [email]);
            if (!result.rows.length) {
                res.status(403).json({ message: 'Unauthorized student' });
                return;
            }
            user = result.rows[0];
            if (!user) {
                res.status(403).json({ message: 'Unauthorized student' });
                return;
            }

            // IMPORTANT: Eligibility check for students: must be of hyderabad campus and within 5 years of start year
            if (!email.endsWith('@hyderabad.bits-pilani.ac.in')) {
                res.status(403).json({ message: 'Student Not Authorized: does not meet eligibility criteria' });
                return;
            }
            const currentYear = new Date().getFullYear();
            if (user.start_year > currentYear || user.start_year < currentYear - 5) {
                res.status(403).json({ message: 'Student Not Authorized: does not meet eligibility criteria' });
                return;
            }
            
            // Respond with student profile and token
            console.log(`[AUTH] Student authenticated: ${email}`);
            const token = signToken(user.student_id, user.email, 'student');
            res.json({
                token,
                user: {
                    student_id: user.student_id,
                    student_name: user.student_name,
                    email: user.email,
                    start_year: user.start_year,
                    end_year: user.end_year,
                },
            });
            return;
        }
        else {
            res.status(400).json({ message: 'Invalid role specified' });
            return;
        }
    }
    catch (err) {
        console.error('[AUTH ERROR] Google authentication failed:', err);
        res.status(500).json({ message: 'Internal server error during authentication' });
    }
}