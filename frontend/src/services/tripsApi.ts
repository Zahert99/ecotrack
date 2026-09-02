import { apiRequest } from "@/services/api";
import type { Trip, TripInput } from "@/types/api";

export function listTrips(): Promise<Trip[]> {
  return apiRequest<Trip[]>("/api/trips");
}

export function getTrip(tripId: string): Promise<Trip> {
  return apiRequest<Trip>(`/api/trips/${tripId}`);
}

export function createTrip(input: TripInput): Promise<Trip> {
  return apiRequest<Trip>("/api/trips", { method: "POST", data: input });
}

export function updateTrip(tripId: string, input: TripInput): Promise<Trip> {
  return apiRequest<Trip>(`/api/trips/${tripId}`, { method: "PUT", data: input });
}

export function deleteTrip(tripId: string): Promise<void> {
  return apiRequest<void>(`/api/trips/${tripId}`, { method: "DELETE" });
}
