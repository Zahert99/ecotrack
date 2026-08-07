import { NextFunction, Request, Response } from 'express';
import { DatabaseError } from 'pg';
import { ZodError } from 'zod';

const CHECK_VIOLATION = '23514';

export class HttpError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: { message: 'Invalid request', code: 'VALIDATION_ERROR', issues: err.issues },
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: { message: err.message, code: err.code } });
    return;
  }

  if (err instanceof DatabaseError && err.code === CHECK_VIOLATION) {
    res.status(400).json({
      error: { message: 'Request violates a data constraint', code: 'CONSTRAINT_VIOLATION' },
    });
    return;
  }

  console.error('Unexpected error', err);
  res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
}
