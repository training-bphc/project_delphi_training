import { Request, Response, NextFunction } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Wraps an async Express route handler so that any thrown error or rejected
 * promise is forwarded to next(err), reaching the global error handler.
 *
 * Without this wrapper, Express 4 silently swallows async errors.
 *
 * Usage:
 *   router.post('/route', asyncHandler(async (req, res, next) => { ... }));
 */
export const asyncHandler = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
