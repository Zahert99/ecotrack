"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ClipboardCheck, X } from "../icons";
import { useIsDesktop } from "../shared/useIsDesktop";
import {
  TRANSPORT_OPTIONS,
  calculateCo2eKg,
  type SimulatorFuelType,
  type SimulatorTransportType,
} from "./emissionFactors";

interface ApprovalDrawerProps {
  open: boolean;
  onClose: () => void;
  reducedMotion: boolean;
  transportType: SimulatorTransportType;
  fuelType: SimulatorFuelType;
  distanceKm: number;
  co2eKg: number;
}

export function ApprovalDrawer({
  open,
  onClose,
  reducedMotion,
  transportType,
  fuelType,
  distanceKm,
  co2eKg,
}: ApprovalDrawerProps) {
  const isDesktop = useIsDesktop();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    function handlePointerDown(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open, onClose]);

  const proposedDistanceKm = distanceKm + 80;
  const proposedCo2eKg = calculateCo2eKg(transportType, fuelType, proposedDistanceKm);
  const transportLabel = TRANSPORT_OPTIONS.find((option) => option.value === transportType)?.label ?? transportType;

  const slideVariants = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : isDesktop
      ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
      : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };
  const transition = reducedMotion
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-landing-ink/30"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Simulated admin approval"
            initial={slideVariants.initial}
            animate={slideVariants.animate}
            exit={slideVariants.exit}
            transition={transition}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-landing-border bg-landing-surface p-6 shadow-2xl sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:w-96 sm:rounded-t-none sm:rounded-l-2xl sm:border-t-0 sm:border-l"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-landing-accent">
                <ClipboardCheck className="h-4 w-4" /> Admin Approval Queue
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-1 text-landing-muted hover:bg-landing-bg hover:text-landing-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm text-landing-ink">
              Proposed edit · Trip #204 · {transportLabel}
            </p>
            <p className="mt-1 text-xs text-landing-muted">
              A teammate with company-wide view access proposed a correction. Nothing changes
              until you approve it.
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-landing-border p-4 text-sm">
              <dt className="text-landing-muted">Distance</dt>
              <dd className="text-right text-landing-ink line-through opacity-60">{distanceKm} km</dd>
              <dt className="text-landing-muted">Proposed distance</dt>
              <dd className="text-right font-semibold text-landing-ink">{proposedDistanceKm} km</dd>
              <dt className="text-landing-muted">CO2e</dt>
              <dd className="text-right text-landing-ink line-through opacity-60">
                {co2eKg.toFixed(1)} kg
              </dd>
              <dt className="text-landing-muted">Proposed CO2e</dt>
              <dd className="text-right font-semibold text-landing-ink">
                {proposedCo2eKg.toFixed(1)} kg
              </dd>
            </dl>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-landing-accent px-4 py-2 text-sm font-semibold text-landing-accent-foreground hover:bg-landing-accent/90"
              >
                <Check className="h-4 w-4" /> Approve
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-landing-border px-4 py-2 text-sm font-semibold text-landing-ink hover:bg-landing-bg"
              >
                <X className="h-4 w-4" /> Reject
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
