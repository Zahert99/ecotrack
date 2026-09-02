import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuthContext } from '../middleware/auth';
import * as permissionRequestService from '../services/permissionRequestService';

export const resolvePermissionRequestSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED']),
  })
  .strict();

export const createPermissionRequestSchema = z
  .object({
    type: z.enum(['VIEW_COMPANY_DATA', 'ADMIN_ROLE']).default('VIEW_COMPANY_DATA'),
  })
  .strict();

const permissionRequestIdParamSchema = z.uuid();

function requirePermissionRequestId(req: Request): string {
  return permissionRequestIdParamSchema.parse(req.params.id);
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const request = await permissionRequestService.createRequest(
      auth.companyId,
      auth,
      req.body.type,
    );
    res.status(201).json({ data: request });
  } catch (err) {
    next(err);
  }
}

export async function myStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const request = await permissionRequestService.getMyStatus(auth.companyId, auth);
    res.status(200).json({ data: request });
  } catch (err) {
    next(err);
  }
}

export async function listPending(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const requests = await permissionRequestService.listPending(auth.companyId);
    res.status(200).json({ data: requests });
  } catch (err) {
    next(err);
  }
}

export async function resolve(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const request = await permissionRequestService.resolveRequest(
      auth.companyId,
      requirePermissionRequestId(req),
      req.body.status,
    );
    res.status(200).json({ data: request });
  } catch (err) {
    next(err);
  }
}
