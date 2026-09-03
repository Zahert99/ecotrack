import type { FuelType, PublicUser, TransportType } from "@/types/api";

export const TRANSPORT_LABELS: Record<TransportType, string> = {
  CAR: "Car",
  BUS: "Bus",
  TRAIN: "Train",
  FLIGHT: "Flight",
};

export const FUEL_LABELS: Record<FuelType, string> = {
  PETROL: "Petrol",
  DIESEL: "Diesel",
  HYBRID: "Hybrid",
  ELECTRIC: "Electric",
};

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function resolveUserLabel(users: PublicUser[] | undefined, userId: string): string {
  const user = users?.find((u) => u.id === userId);
  return user ? `${user.firstName} ${user.lastName}` : "Unknown user";
}
