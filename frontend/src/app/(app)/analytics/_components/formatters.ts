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

export const TRANSPORT_COLORS: Record<TransportType, string> = {
  CAR: "--chart-1",
  BUS: "--chart-2",
  TRAIN: "--chart-3",
  FLIGHT: "--chart-4",
};

export const FUEL_LABELS: Record<FuelType, string> = {
  PETROL: "Petrol",
  DIESEL: "Diesel",
  HYBRID: "Hybrid",
  ELECTRIC: "Electric",
};

export const FUEL_COLORS: Record<FuelType, string> = {
  PETROL: "--chart-1",
  DIESEL: "--chart-2",
  HYBRID: "--chart-3",
  ELECTRIC: "--chart-4",
};
