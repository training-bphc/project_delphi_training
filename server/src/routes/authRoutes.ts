/**
 * AUTHENTICATION ROUTES
 * 
 * Defines all authentication-related endpoints:
 * - Google OAuth login
 * - Get current user profile
 */

import { Router } from 'express';
import { googleAuth } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/google - Google OAuth login (student or admin)
router.post('/google', googleAuth);

// GET /api/auth/me - Returns current authenticated user's profile
// Requires valid JWT token in Authorization header
// router.get('/me', authenticate, getMe);

export default router;