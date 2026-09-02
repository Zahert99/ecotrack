import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuthContext } from '../middleware/auth';
import * as tripEditRequestService from '../services/tripEditRequestService';

export const resolveTripEditRequestSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED']),
  })
  .strict();

const tripIdParamSchema = z.uuid();
const editRequestIdParamSchema = z.uuid();

function requireTripId(req: Request): string {
  return tripIdParamSchema.parse(req.params.tripId);
}

function requireEditRequestId(req: Request): string {
  return editRequestIdParamSchema.parse(req.params.id);
}

export async function propose(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const request = await tripEditRequestService.proposeEdit(
      auth.companyId,
      auth,
      requireTripId(req),
      req.body,
    );
    res.status(201).json({ data: request });
  } catch (err) {
    next(err);
  }
}

export async function mine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const request = await tripEditRequestService.getMine(auth.companyId, auth, requireTripId(req));
    res.status(200).json({ data: request });
  } catch (err) {
    next(err);
  }
}

export async function listPending(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const requests = await tripEditRequestService.listPending(auth.companyId);
    res.status(200).json({ data: requests });
  } catch (err) {
    next(err);
  }
}

export async function resolve(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const request = await tripEditRequestService.resolve(
      auth.companyId,
      requireEditRequestId(req),
      req.body.status,
    );
    res.status(200).json({ data: request });
  } catch (err) {
    next(err);
  }
}
