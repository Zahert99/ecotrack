import { apiRequest } from "@/services/api";
import type { CompanySummary } from "@/types/api";

export function getCompanySummary(): Promise<CompanySummary> {
  return apiRequest<CompanySummary>("/api/company");
}
