import { NextFunction, Request, Response } from 'express';
import { requireAuthContext } from '../middleware/auth';
import * as analyticsService from '../services/analyticsService';

export async function summary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const data = await analyticsService.getSummary(auth.companyId, auth);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function byTransport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const data = await analyticsService.getByTransport(auth.companyId, auth);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function trends(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const data = await analyticsService.getTrends(auth.companyId, auth);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function byFuelType(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const data = await analyticsService.getByFuelType(auth.companyId, auth);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function quarterlyComparison(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const data = await analyticsService.getQuarterlyYoyComparison(auth.companyId, auth);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}
