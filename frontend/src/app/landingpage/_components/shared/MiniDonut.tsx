"use client";

import { useMemo } from "react";
import type { SimulatorTransportType } from "../simulator/emissionFactors";

// Illustrative transport-mode share, echoing the real /analytics transport
// breakdown donut's shape. One accent hue at different opacities — this is
// decorative reference data (a typical company's monthly mix), not a chart
// a viewer needs to compare series in, so it doesn't need a validated
// categorical palette.
const SEGMENTS: { key: SimulatorTransportType; label: string; share: number }[] = [
  { key: "CAR", label: "Car", share: 0.46 },
  { key: "FLIGHT", label: "Flight", share: 0.34 },
  { key: "TRAIN", label: "Train", share: 0.2 },
];

function DonutSegment({
  share,
  offset,
  active,
}: {
  share: number;
  offset: number;
  active: boolean;
}) {
  return (
    <circle
      cx="50"
      cy="50"
      r="40"
      fill="none"
      stroke="var(--landing-accent)"
      strokeOpacity={active ? 1 : 0.25}
      strokeWidth={active ? 16 : 12}
      strokeDasharray={`${share * 251.33} 251.33`}
      strokeDashoffset={-offset * 251.33}
      className="transition-[stroke-width,stroke-opacity] duration-500 ease-out"
    />
  );
}

export function MiniDonut({ activeTransportType }: { activeTransportType: SimulatorTransportType }) {
  const segments = useMemo(
    () =>
      SEGMENTS.map((segment, i) => ({
        ...segment,
        offset: SEGMENTS.slice(0, i).reduce((sum, s) => sum + s.share, 0),
      })),
    [],
  );

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-20 w-20 shrink-0">
        <g transform="rotate(-90 50 50)">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--landing-border)" strokeWidth="12" />
          {segments.map((segment) => (
            <DonutSegment
              key={segment.label}
              share={segment.share}
              offset={segment.offset}
              active={segment.key === activeTransportType}
            />
          ))}
        </g>
      </svg>
      <ul className="flex flex-col gap-1.5 text-xs text-landing-ink">
        {segments.map((segment) => (
          <li
            key={segment.label}
            className={`flex items-center gap-2 transition-opacity duration-500 ${
              segment.key === activeTransportType ? "font-semibold opacity-100" : "opacity-50"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-landing-accent" />
            {segment.label} · {Math.round(segment.share * 100)}%
          </li>
        ))}
      </ul>
    </div>
  );
}
