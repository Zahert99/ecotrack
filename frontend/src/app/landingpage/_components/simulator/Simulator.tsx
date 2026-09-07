"use client";

import { useState } from "react";
import { ApprovalDrawer } from "./ApprovalDrawer";
import { ControlPanel } from "./ControlPanel";
import { DEFAULT_DISTANCE_KM } from "./DistanceSlider";
import { calculateCo2eKg, type SimulatorFuelType, type SimulatorTransportType } from "./emissionFactors";
import { LiveDashboard } from "./LiveDashboard";

export function Simulator({ reducedMotion }: { reducedMotion: boolean }) {
  const [transportType, setTransportType] = useState<SimulatorTransportType>("CAR");
  const [fuelType, setFuelType] = useState<SimulatorFuelType>("PETROL");
  const [distanceKm, setDistanceKm] = useState(DEFAULT_DISTANCE_KM);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const co2eKg = calculateCo2eKg(transportType, fuelType, distanceKm);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:gap-8">
      <ControlPanel
        transportType={transportType}
        fuelType={fuelType}
        distanceKm={distanceKm}
        onTransportChange={setTransportType}
        onFuelChange={setFuelType}
        onDistanceChange={setDistanceKm}
        onProposeEdit={() => setDrawerOpen(true)}
      />
      <LiveDashboard
        transportType={transportType}
        fuelType={fuelType}
        co2eKg={co2eKg}
        reducedMotion={reducedMotion}
      />
      <ApprovalDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        reducedMotion={reducedMotion}
        transportType={transportType}
        fuelType={fuelType}
        distanceKm={distanceKm}
        co2eKg={co2eKg}
      />
    </div>
  );
}
