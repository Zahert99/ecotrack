import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService';

export const signupSchema = z
  .object({
    companyName: z.string().trim().min(1).max(255),
    email: z.string().trim().toLowerCase().email().max(255),
    password: z.string().min(8).max(72),
    firstName: z.string().trim().min(1).max(255),
    lastName: z.string().trim().min(1).max(255),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(255),
    password: z.string().min(1),
  })
  .strict();

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}
