import { apiRequest } from "@/services/api";
import type {
  FuelBreakdown,
  MonthlySummary,
  MonthlyTrend,
  QuarterlyComparison,
  TransportBreakdown,
} from "@/types/api";

export function getSummary(): Promise<MonthlySummary> {
  return apiRequest<MonthlySummary>("/api/analytics/summary");
}

export function getTrends(): Promise<MonthlyTrend[]> {
  return apiRequest<MonthlyTrend[]>("/api/analytics/trends");
}

export function getByTransport(): Promise<TransportBreakdown[]> {
  return apiRequest<TransportBreakdown[]>("/api/analytics/by-transport");
}

export function getByFuelType(): Promise<FuelBreakdown[]> {
  return apiRequest<FuelBreakdown[]>("/api/analytics/by-fuel-type");
}

export function getQuarterlyComparison(): Promise<QuarterlyComparison[]> {
  return apiRequest<QuarterlyComparison[]>("/api/analytics/quarterly-comparison");
}
