/**
 * AUTHENTICATION ROUTES
 * 
 * Defines all authentication-related endpoints:
 * - Email/Password login and signup
 * - Magic link (optional)
 */

import { Router } from 'express';
import { login, signUp, magicLink } from '../controllers/authController';

const router = Router();

// POST /api/auth/signup - Register new user
router.post('/signup', signUp);

// POST /api/auth/login - Login with email and password
router.post('/login', login);

// POST /api/auth/magic-link - Send magic link to email (optional)
router.post('/magic-link', magicLink);

export default router;