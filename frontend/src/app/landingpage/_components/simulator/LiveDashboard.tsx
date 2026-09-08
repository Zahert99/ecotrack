"use client";

import { MiniDonut } from "../shared/MiniDonut";
import { MiniEfficiencyBars } from "../shared/MiniEfficiencyBars";
import { Co2eBadge } from "./Co2eBadge";
import { factorKey, type SimulatorFuelType, type SimulatorTransportType } from "./emissionFactors";

interface LiveDashboardProps {
  transportType: SimulatorTransportType;
  fuelType: SimulatorFuelType;
  co2eKg: number;
  reducedMotion: boolean;
}

export function LiveDashboard({ transportType, fuelType, co2eKg, reducedMotion }: LiveDashboardProps) {
  const activeKey = factorKey(transportType, fuelType);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-landing-border bg-landing-surface p-6 shadow-sm">
      <Co2eBadge co2eKg={co2eKg} reducedMotion={reducedMotion} />
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-landing-muted uppercase">
          Efficiency by mode
        </p>
        <MiniEfficiencyBars activeKey={activeKey} />
        <p className="mt-2 text-xs text-landing-muted">
          Emission factors: Naturvårdsverket / Trafikverket
        </p>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-landing-muted uppercase">
          Typical company mix
        </p>
        <MiniDonut activeTransportType={transportType} />
      </div>
    </div>
  );
}
