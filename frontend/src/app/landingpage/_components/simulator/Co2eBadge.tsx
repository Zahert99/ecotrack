"use client";

import { Leaf } from "../icons";
import { useLiveCo2e } from "../shared/useLiveCo2e";

export function Co2eBadge({ co2eKg, reducedMotion }: { co2eKg: number; reducedMotion: boolean }) {
  const displayed = useLiveCo2e(co2eKg, reducedMotion);

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-landing-border bg-landing-surface px-6 py-4 shadow-sm">
      <Leaf className="h-5 w-5 text-landing-accent" />
      <span className="font-mono text-3xl font-bold tabular-nums text-landing-ink">
        {displayed.toFixed(1)}
      </span>
      <span className="text-sm text-landing-muted">kg CO2e</span>
    </div>
  );
}
