import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  findAllVerificationRequests,
  findVerificationRequestById,
  updateVerificationRequestStatus,
} from '../repositories/recordsRepository';

export const getVerificationRequestsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;

    try {
      const requests = await findAllVerificationRequests(
        status as 'Pending' | 'Verified' | 'Rejected' | undefined,
      );
      res.status(200).json({ success: true, data: requests });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid status filter') {
        res.status(400).json({
          success: false,
          message: 'status must be pending, verified, or rejected',
        });
        return;
      }
      throw error;
    }
  },
);

export const getVerificationRequestByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const request = await findVerificationRequestById(Number(requestId));

    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    res.status(200).json({ success: true, data: request });
  },
);

export const verifyRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const requestId = Number(req.params.requestId);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    res.status(400).json({ success: false, message: 'Invalid request ID' });
    return;
  }

  const updatedRequest = await updateVerificationRequestStatus(
    requestId,
    'Verified',
    req.user?.email,
  );

  if (!updatedRequest) {
    res.status(404).json({ success: false, message: 'Request not found' });
    return;
  }

  res.status(200).json({ success: true, data: updatedRequest });
});

export const rejectRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const requestId = Number(req.params.requestId);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    res.status(400).json({ success: false, message: 'Invalid request ID' });
    return;
  }

  const updatedRequest = await updateVerificationRequestStatus(
    requestId,
    'Rejected',
    req.user?.email,
  );

  if (!updatedRequest) {
    res.status(404).json({ success: false, message: 'Request not found' });
    return;
  }

  res.status(200).json({ success: true, data: updatedRequest });
});
