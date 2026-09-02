import { apiRequest } from "@/services/api";
import type { TripEditRequest, TripInput } from "@/types/api";

export function proposeEdit(tripId: string, input: TripInput): Promise<TripEditRequest> {
  return apiRequest<TripEditRequest>(`/api/trips/${tripId}/edit-requests`, {
    method: "POST",
    data: input,
  });
}

export function getMine(tripId: string): Promise<TripEditRequest | null> {
  return apiRequest<TripEditRequest | null>(`/api/trips/${tripId}/edit-requests/mine`);
}
