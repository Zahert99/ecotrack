import type { FuelType, TransportType } from "@/types/api";

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

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type DatePreset = "last30" | "thisMonth" | "thisYear";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
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
