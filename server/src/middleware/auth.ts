import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { UserRole }    from '../types';

// Augment the Express Request type so req.user is available in all route handlers.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id:    string;
        email: string;
        role:  UserRole;
      };
    }
  }
}

/**
 * Verifies the JWT Bearer token in the Authorization header.
 * On success, attaches decoded payload to req.user and calls next().
 * On failure, responds 401 immediately.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * Checks that req.user.role is one of the allowed roles.
 * Must be used after authenticate.
 * On failure, responds 403 immediately.
 */
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
