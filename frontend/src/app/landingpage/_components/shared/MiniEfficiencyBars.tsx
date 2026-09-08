"use client";

// Real seeded emission factors (kg CO2e / km) — same numbers the actual
// /analytics Efficiency by Transport Mode chart is built from.
const ROWS = [
  { key: "CAR_PETROL", label: "Car (Petrol)", value: 0.165 },
  { key: "FLIGHT", label: "Flight", value: 0.136 },
  { key: "CAR_ELECTRIC", label: "Car (Electric)", value: 0.025 },
  { key: "TRAIN", label: "Train", value: 0.007 },
];
const MAX_VALUE = 0.165;

function Bar({ label, value, active }: { label: string; value: number; active: boolean }) {
  return (
    <div>
      <div
        className={`flex items-baseline justify-between text-xs transition-opacity duration-500 ${
          active ? "font-semibold text-landing-ink opacity-100" : "text-landing-ink opacity-50"
        }`}
      >
        <span>{label}</span>
        <span className="font-mono text-landing-muted">{value.toFixed(3)} kg/km</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-landing-border">
        <div
          style={{ width: `${(value / MAX_VALUE) * 100}%` }}
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${
            active ? "bg-landing-accent" : "bg-landing-accent/40"
          }`}
        />
      </div>
    </div>
  );
}

export function MiniEfficiencyBars({ activeKey }: { activeKey: string }) {
  return (
    <div className="flex flex-col justify-center gap-3">
      {ROWS.map((row) => (
        <Bar key={row.key} label={row.label} value={row.value} active={row.key === activeKey} />
      ))}
    </div>
  );
}
