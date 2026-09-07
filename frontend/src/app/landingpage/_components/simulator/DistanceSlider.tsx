"use client";

import { Gauge } from "../icons";

const MIN_KM = 50;
const MAX_KM = 800;

export const DEFAULT_DISTANCE_KM = 470;

export function DistanceSlider({
  distanceKm,
  onChange,
}: {
  distanceKm: number;
  onChange: (distanceKm: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-medium text-landing-ink">
        <span className="flex items-center gap-1.5">
          <Gauge className="h-4 w-4 text-landing-muted" /> Distance
        </span>
        <span className="font-mono tabular-nums">{distanceKm} km</span>
      </div>
      <input
        type="range"
        min={MIN_KM}
        max={MAX_KM}
        step={10}
        value={distanceKm}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Trip distance in kilometers"
        className="mt-2 w-full accent-landing-accent"
      />
      <p className="mt-1 text-xs text-landing-muted">
        Gothenburg → Stockholm ≈ {DEFAULT_DISTANCE_KM} km
      </p>
    </div>
  );
}
