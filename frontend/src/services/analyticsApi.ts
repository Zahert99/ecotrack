import { apiRequest } from "@/services/api";
import type { MonthlySummary, MonthlyTrend, TransportBreakdown } from "@/types/api";

export function getSummary(): Promise<MonthlySummary> {
  return apiRequest<MonthlySummary>("/api/analytics/summary");
}

export function getTrends(): Promise<MonthlyTrend[]> {
  return apiRequest<MonthlyTrend[]>("/api/analytics/trends");
}

export function getByTransport(): Promise<TransportBreakdown[]> {
  return apiRequest<TransportBreakdown[]>("/api/analytics/by-transport");
}
