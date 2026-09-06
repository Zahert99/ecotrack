import { NextFunction, Request, Response } from 'express';
import { requireAuthContext } from '../middleware/auth';
import * as companyService from '../services/companyService';

export async function summary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(req);
    const data = await companyService.getCompanySummary(auth.companyId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}
