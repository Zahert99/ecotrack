import { pool } from '../database/pool';
import {
  CompanySummary,
  getCompanySummary as getCompanySummaryRow,
} from '../repositories/companyRepository';
import { HttpError } from '../middleware/errorHandler';

export async function getCompanySummary(companyId: string): Promise<CompanySummary> {
  const summary = await getCompanySummaryRow(pool, companyId);
  if (!summary) {
    throw new HttpError(404, 'COMPANY_NOT_FOUND', 'Company not found');
  }
  return summary;
}
