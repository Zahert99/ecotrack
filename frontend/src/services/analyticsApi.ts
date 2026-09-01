import { apiRequest } from "@/services/api";
import type { MonthlySummary, MonthlyTrend } from "@/types/api";

export function getSummary(): Promise<MonthlySummary> {
  return apiRequest<MonthlySummary>("/api/analytics/summary");
}

export function getTrends(): Promise<MonthlyTrend[]> {
  return apiRequest<MonthlyTrend[]>("/api/analytics/trends");
}
