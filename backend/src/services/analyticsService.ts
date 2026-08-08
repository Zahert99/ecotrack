import { pool } from '../database/pool';
import {
  getBreakdownByTransport,
  getMonthlySummary,
  getMonthlyTrends,
  MonthlySummary,
  MonthlyTrend,
  TransportBreakdown,
} from '../repositories/analyticsRepository';
import { UserRole } from '../repositories/userRepository';
import { resolveCompanyScope } from './scopeResolver';

interface Requester {
  userId: string;
  role: UserRole;
  canViewCompanyData: boolean;
}

export async function getSummary(companyId: string, requester: Requester): Promise<MonthlySummary> {
  return getMonthlySummary(pool, companyId, resolveCompanyScope(requester));
}

export async function getByTransport(
  companyId: string,
  requester: Requester,
): Promise<TransportBreakdown[]> {
  return getBreakdownByTransport(pool, companyId, resolveCompanyScope(requester));
}

export async function getTrends(companyId: string, requester: Requester): Promise<MonthlyTrend[]> {
  return getMonthlyTrends(pool, companyId, resolveCompanyScope(requester));
}
