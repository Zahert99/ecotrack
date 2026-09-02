"use client";

import type { TransportType } from "@/types/api";
import { computePresetRange, type DatePreset } from "./formatters";
import { TransportFilterSelect } from "./TransportFilterSelect";

export interface TripFilters {
  transportType: TransportType | "ALL";
  from: string;
  to: string;
}

interface FilterBarProps {
  filters: TripFilters;
  onChange: (filters: TripFilters) => void;
}

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: "last30", label: "Last 30 Days" },
  { key: "thisMonth", label: "This Month" },
  { key: "thisYear", label: "This Year" },
];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const activePreset = PRESETS.find((preset) => {
    const range = computePresetRange(preset.key);
    return range.from === filters.from && range.to === filters.to;
  })?.key;

  const hasActiveFilters = filters.transportType !== "ALL" || filters.from !== "" || filters.to !== "";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Transport Mode</label>
          <TransportFilterSelect
            value={filters.transportType}
            onChange={(transportType) => onChange({ ...filters, transportType })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">From</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => onChange({ ...filters, from: e.target.value })}
            className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => onChange({ ...filters, to: e.target.value })}
            className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => onChange({ ...filters, ...computePresetRange(preset.key) })}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              activePreset === preset.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {preset.label}
          </button>
        ))}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onChange({ transportType: "ALL", from: "", to: "" })}
            className="rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
