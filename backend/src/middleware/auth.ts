import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/jwtConfig';
import { pool } from '../database/pool';
import { findCanViewCompanyDataById, UserRole } from '../repositories/userRepository';
import { HttpError } from './errorHandler';

interface AccessTokenClaims {
  sub: string;
  companyId: string;
  role: UserRole;
}

function isAccessTokenClaims(payload: unknown): payload is AccessTokenClaims {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof (payload as Record<string, unknown>).sub === 'string' &&
    typeof (payload as Record<string, unknown>).companyId === 'string' &&
    typeof (payload as Record<string, unknown>).role === 'string'
  );
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.header('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

  if (!token) {
    next(new HttpError(401, 'UNAUTHENTICATED', 'Missing bearer token'));
    return;
  }

  let payload: unknown;
  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch {
    next(new HttpError(401, 'UNAUTHENTICATED', 'Invalid or expired token'));
    return;
  }

  if (!isAccessTokenClaims(payload)) {
    next(new HttpError(401, 'UNAUTHENTICATED', 'Invalid token payload'));
    return;
  }

  let canViewCompanyData: boolean | null;
  try {
    canViewCompanyData = await findCanViewCompanyDataById(pool, payload.sub);
  } catch (err) {
    next(err);
    return;
  }

  if (canViewCompanyData === null) {
    next(new HttpError(401, 'UNAUTHENTICATED', 'Account no longer exists'));
    return;
  }

  req.auth = {
    userId: payload.sub,
    companyId: payload.companyId,
    role: payload.role,
    canViewCompanyData,
  };
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      next(new HttpError(403, 'FORBIDDEN', 'You do not have permission to perform this action'));
      return;
    }
    next();
  };
}

export function requireAuthContext(req: Request): NonNullable<Request['auth']> {
  if (!req.auth) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Missing authentication context');
  }
  return req.auth;
}
