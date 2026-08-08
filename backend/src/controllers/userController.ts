import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuthContext } from '../middleware/auth';
import * as userService from '../services/userService';

const userRoleEnum = z.enum(['ADMIN', 'USER']);

export const createUserSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(255),
    password: z.string().min(8).max(72),
    firstName: z.string().trim().min(1).max(255),
    lastName: z.string().trim().min(1).max(255),
    role: userRoleEnum.default('USER'),
  })
  .strict();

export const updatePermissionsSchema = z
  .object({
    canViewCompanyData: z.boolean(),
  })
  .strict();

const userIdParamSchema = z.uuid();

function requireUserId(req: Request): string {
  return userIdParamSchema.parse(req.params.id);
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const user = await userService.createUser(auth.companyId, req.body);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const users = await userService.listUsers(auth.companyId);
    res.status(200).json({ data: users });
  } catch (err) {
    next(err);
  }
}

export async function updatePermissions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const user = await userService.updatePermissions(
      auth.companyId,
      requireUserId(req),
      req.body.canViewCompanyData,
    );
    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
}
