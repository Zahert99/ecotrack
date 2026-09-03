import { apiRequest } from "@/services/api";
import type { TripEditRequest, TripEditRequestWithTrip, TripInput } from "@/types/api";

export function proposeEdit(tripId: string, input: TripInput): Promise<TripEditRequest> {
  return apiRequest<TripEditRequest>(`/api/trips/${tripId}/edit-requests`, {
    method: "POST",
    data: input,
  });
}

export function getMine(tripId: string): Promise<TripEditRequest | null> {
  return apiRequest<TripEditRequest | null>(`/api/trips/${tripId}/edit-requests/mine`);
}

export function listPendingTripEditRequests(): Promise<TripEditRequestWithTrip[]> {
  return apiRequest<TripEditRequestWithTrip[]>("/api/trip-edit-requests");
}

export function resolveTripEditRequest(
  id: string,
  status: "APPROVED" | "REJECTED",
): Promise<TripEditRequest> {
  return apiRequest<TripEditRequest>(`/api/trip-edit-requests/${id}`, {
    method: "PATCH",
    data: { status },
  });
}
