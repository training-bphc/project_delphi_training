import jwt from 'jsonwebtoken';
import { JwtPayload, UserRole } from '../types';

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// Fail at startup rather than silently using a weak fallback secret.
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export const signToken = (id: string, email: string, role: UserRole): string => {
  return jwt.sign({ id, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

