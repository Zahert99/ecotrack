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

interface Requester {
  userId: string;
  role: UserRole;
}

function resolveScope(requester: Requester): string | null {
  return requester.role === 'ADMIN' ? null : requester.userId;
}

export async function getSummary(companyId: string, requester: Requester): Promise<MonthlySummary> {
  return getMonthlySummary(pool, companyId, resolveScope(requester));
}

export async function getByTransport(
  companyId: string,
  requester: Requester,
): Promise<TransportBreakdown[]> {
  return getBreakdownByTransport(pool, companyId, resolveScope(requester));
}

export async function getTrends(companyId: string, requester: Requester): Promise<MonthlyTrend[]> {
  return getMonthlyTrends(pool, companyId, resolveScope(requester));
}
