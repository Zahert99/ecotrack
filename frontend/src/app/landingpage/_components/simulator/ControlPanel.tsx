"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Car, Fuel, Plane, TrainFront } from "../icons";
import {
  FUEL_OPTIONS,
  TRANSPORT_OPTIONS,
  type SimulatorFuelType,
  type SimulatorTransportType,
} from "./emissionFactors";
import { DistanceSlider } from "./DistanceSlider";

const TRANSPORT_ICONS: Record<SimulatorTransportType, LucideIcon> = {
  CAR: Car,
  TRAIN: TrainFront,
  FLIGHT: Plane,
};

interface ControlPanelProps {
  transportType: SimulatorTransportType;
  fuelType: SimulatorFuelType;
  distanceKm: number;
  onTransportChange: (transportType: SimulatorTransportType) => void;
  onFuelChange: (fuelType: SimulatorFuelType) => void;
  onDistanceChange: (distanceKm: number) => void;
  onProposeEdit: () => void;
}

export function ControlPanel({
  transportType,
  fuelType,
  distanceKm,
  onTransportChange,
  onFuelChange,
  onDistanceChange,
  onProposeEdit,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-landing-border bg-landing-surface p-6 shadow-sm">
      <div>
        <span className="text-sm font-medium text-landing-ink">Transport mode</span>
        <div className="mt-2 flex gap-2">
          {TRANSPORT_OPTIONS.map((option) => {
            const Icon = TRANSPORT_ICONS[option.value];
            const active = option.value === transportType;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onTransportChange(option.value)}
                className="relative flex-1 rounded-lg px-3 py-2 text-sm font-medium"
              >
                {active && (
                  <motion.span
                    layoutId="active-transport-pill"
                    className="absolute inset-0 rounded-lg bg-landing-accent"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span
                  className={`relative z-10 flex items-center justify-center gap-1.5 ${
                    active ? "text-landing-accent-foreground" : "text-landing-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {transportType === "CAR" && (
          <motion.div
            key="fuel-toggle"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <span className="flex items-center gap-1.5 text-sm font-medium text-landing-ink">
              <Fuel className="h-4 w-4 text-landing-muted" /> Fuel type
            </span>
            <div className="mt-2 flex gap-2">
              {FUEL_OPTIONS.map((option) => {
                const active = option.value === fuelType;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onFuelChange(option.value)}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-landing-accent bg-landing-accent/10 text-landing-accent"
                        : "border-landing-border text-landing-muted hover:text-landing-ink"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DistanceSlider distanceKm={distanceKm} onChange={onDistanceChange} />

      <button
        type="button"
        onClick={onProposeEdit}
        className="rounded-lg border border-landing-border px-4 py-2 text-sm font-semibold text-landing-ink transition-colors hover:bg-landing-bg"
      >
        Propose Edit
      </button>
    </div>
  );
}
