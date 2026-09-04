import type { FuelType, PublicUser, Trip, TransportType } from "@/types/api";

export function formatCo2e(kg: number): { value: string; unit: string } {
  if (kg >= 1000) {
    return { value: (kg / 1000).toFixed(1), unit: "t" };
  }
  return { value: Math.round(kg).toLocaleString(), unit: "kg" };
}

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

export function resolveTripOwnerLabel(users: PublicUser[] | undefined, trip: Trip): string {
  if (trip.userId) {
    const owner = users?.find((u) => u.id === trip.userId);
    if (owner) return `${owner.firstName} ${owner.lastName}`;
  }
  return trip.deletedUserName ?? "Former user";
}

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type DatePreset = "last30" | "thisMonth" | "thisYear";

export function toIsoDate(date: Date): string {
  // Format using the LOCAL calendar date, not toISOString()'s UTC
  // conversion — that would roll dates back by one in any timezone ahead
  // of UTC (e.g. local midnight on the 1st becomes the last day of the
  // previous month in UTC).
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIsoDate(): string {
  return toIsoDate(new Date());
}

export function computePresetRange(preset: DatePreset): { from: string; to: string } {
  const today = new Date();
  const to = toIsoDate(today);

  if (preset === "last30") {
    const from = new Date(today);
    from.setDate(from.getDate() - 30);
    return { from: toIsoDate(from), to };
  }
  if (preset === "thisMonth") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toIsoDate(from), to };
  }
  const from = new Date(today.getFullYear(), 0, 1);
  return { from: toIsoDate(from), to };
}
