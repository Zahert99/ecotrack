export type SimulatorTransportType = "TRAIN" | "CAR" | "FLIGHT";
export type SimulatorFuelType = "PETROL" | "ELECTRIC";

// Real seeded emission factors (kg CO2e / km) — mirrors
// backend/migrations/1788894988605_add-emission-factor-unit-and-swedish-values.sql
// exactly. CAR is a vehicle-km factor; TRAIN/FLIGHT are passenger-km factors,
// but since this sandbox has no passenger-count input it always computes for
// a single passenger (same as the backend's default passengerCount = 1). The
// sandbox only exposes Petrol/Electric for CAR (the real app also has
// Diesel/Hybrid) to keep the control panel to three clear choices.
export const FACTORS: Record<string, number> = {
  TRAIN: 0.007,
  CAR_PETROL: 0.165,
  CAR_ELECTRIC: 0.025,
  FLIGHT: 0.136,
};

export const TRANSPORT_OPTIONS: { value: SimulatorTransportType; label: string }[] = [
  { value: "CAR", label: "Car" },
  { value: "TRAIN", label: "Train" },
  { value: "FLIGHT", label: "Flight" },
];

export const FUEL_OPTIONS: { value: SimulatorFuelType; label: string }[] = [
  { value: "PETROL", label: "Petrol" },
  { value: "ELECTRIC", label: "Electric" },
];

export function factorKey(transportType: SimulatorTransportType, fuelType: SimulatorFuelType): string {
  return transportType === "CAR" ? `CAR_${fuelType}` : transportType;
}

export function getFactor(transportType: SimulatorTransportType, fuelType: SimulatorFuelType): number {
  return FACTORS[factorKey(transportType, fuelType)];
}

// Mirrors backend/src/services/emissionsService.ts: round(distanceKm * factor, 4).
export function calculateCo2eKg(
  transportType: SimulatorTransportType,
  fuelType: SimulatorFuelType,
  distanceKm: number,
): number {
  const factor = getFactor(transportType, fuelType);
  return Math.round(distanceKm * factor * 10000) / 10000;
}
