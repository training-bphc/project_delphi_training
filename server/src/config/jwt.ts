/**
 * JSON WEB TOKEN (JWT) UTILITIES
 * 
 * Handles JWT signing and verification for user authentication.
 * JWTs are used to maintain stateless authentication across requests.
 */

import jwt from 'jsonwebtoken';
import { JwtPayload, UserRole } from '../types';

// JWT Configuration
// Secret key should be set in environment variables for production
const JWT_SECRET  = process.env.JWT_SECRET  || 'fallback_secret_change_this';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Creates a signed JWT token for authenticated users.
 * 
 * @param id - User's database ID (student_id or admin_id)
 * @param email - User's email address
 * @param role - User's role ('student' or 'admin')
 * @returns Signed JWT token string
 */
export const signToken = (id: string, email: string, role: UserRole): string => {
  console.log(`[JWT] Signing token for ${role}: ${email}`);
  return jwt.sign({ id, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  } as jwt.SignOptions);
};

/**
 * Verifies and decodes a JWT token.
 * 
 * @param token - JWT token string to verify
 * @returns Decoded JWT payload containing user info
 * @throws Error if token is invalid or expired
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
