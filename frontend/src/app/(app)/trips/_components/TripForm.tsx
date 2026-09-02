"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/services/api";
import type { FuelType, Trip, TransportType, TripInput } from "@/types/api";
import { FUEL_LABELS, TRANSPORT_LABELS } from "./formatters";
import { BusIcon, CarIcon, FlightIcon, TrainIcon } from "./icons";

const TRANSPORT_OPTIONS: { type: TransportType; Icon: typeof CarIcon }[] = [
  { type: "CAR", Icon: CarIcon },
  { type: "BUS", Icon: BusIcon },
  { type: "TRAIN", Icon: TrainIcon },
  { type: "FLIGHT", Icon: FlightIcon },
];

const FUEL_OPTIONS: FuelType[] = ["PETROL", "DIESEL", "HYBRID", "ELECTRIC"];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface TripFormProps {
  initialValues?: Trip;
  submitLabel: string;
  helperText?: string;
  onSubmit: (input: TripInput) => Promise<void>;
  onCancel?: () => void;
}

export function TripForm({ initialValues, submitLabel, helperText, onSubmit, onCancel }: TripFormProps) {
  const [transportType, setTransportType] = useState<TransportType>(
    initialValues?.transportType ?? "CAR",
  );
  const [fuelType, setFuelType] = useState<FuelType>(initialValues?.fuelType ?? "PETROL");
  const [distanceKm, setDistanceKm] = useState(
    initialValues ? String(initialValues.distanceKm) : "",
  );
  const [date, setDate] = useState(initialValues?.date ?? today());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        transportType,
        fuelType: transportType === "CAR" ? fuelType : undefined,
        distanceKm: Number(distanceKm),
        date,
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded border border-destructive-muted bg-destructive-muted/50 p-3 text-sm text-destructive-muted-foreground"
        >
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Transport Mode
        </label>
        <div className="grid grid-cols-4 gap-2">
          {TRANSPORT_OPTIONS.map(({ type, Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => setTransportType(type)}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-3 text-xs font-medium transition-colors ${
                transportType === type
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              {TRANSPORT_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="date" className="text-sm font-medium text-muted-foreground">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            max={today()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded border border-border bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="distanceKm" className="text-sm font-medium text-muted-foreground">
            Distance (km)
          </label>
          <input
            id="distanceKm"
            name="distanceKm"
            type="number"
            required
            min="0.01"
            step="0.01"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="w-full rounded border border-border bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {transportType === "CAR" && (
        <div className="flex flex-col gap-1">
          <label htmlFor="fuelType" className="text-sm font-medium text-muted-foreground">
            Fuel Type
          </label>
          <select
            id="fuelType"
            name="fuelType"
            required
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value as FuelType)}
            className="w-full rounded border border-border bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {FUEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {FUEL_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
      )}

      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
