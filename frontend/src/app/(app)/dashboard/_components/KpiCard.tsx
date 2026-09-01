import { TrendingDownIcon, TrendingUpIcon } from "@/app/(app)/_components/icons";
import type { TrendDelta } from "./formatters";

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  delta?: TrendDelta | null;
  deltaTone?: "emissions" | "neutral";
}

function deltaColorClass(direction: "up" | "down", tone: "emissions" | "neutral"): string {
  if (tone === "neutral") return "text-muted-foreground";
  return direction === "down" ? "text-secondary" : "text-destructive";
}

export function KpiCard({ label, value, unit, delta, deltaTone = "neutral" }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold text-primary">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {delta && delta.direction !== "flat" && (
        <p
          className={`mt-2 flex items-center gap-1 text-sm font-medium ${deltaColorClass(delta.direction, deltaTone)}`}
        >
          {delta.direction === "down" ? (
            <TrendingDownIcon className="h-4 w-4" />
          ) : (
            <TrendingUpIcon className="h-4 w-4" />
          )}
          {delta.percent.toFixed(0)}% vs last month
        </p>
      )}
    </div>
  );
}
