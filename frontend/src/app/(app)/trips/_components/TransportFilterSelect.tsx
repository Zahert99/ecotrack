"use client";

import { useEffect, useRef, useState } from "react";
import type { TransportType } from "@/types/api";
import { TRANSPORT_LABELS } from "./formatters";

export type TransportFilterValue = TransportType | "ALL";

interface TransportFilterSelectProps {
  value: TransportFilterValue;
  onChange: (value: TransportFilterValue) => void;
}

const OPTIONS: { value: TransportFilterValue; label: string }[] = [
  { value: "ALL", label: "All Modes" },
  { value: "CAR", label: TRANSPORT_LABELS.CAR },
  { value: "BUS", label: TRANSPORT_LABELS.BUS },
  { value: "TRAIN", label: TRANSPORT_LABELS.TRAIN },
  { value: "FLIGHT", label: TRANSPORT_LABELS.FLIGHT },
];

export function TransportFilterSelect({ value, onChange }: TransportFilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const activeLabel = OPTIONS.find((option) => option.value === value)?.label ?? "All Modes";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded border border-border bg-background px-3 py-2 text-left text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <span>{activeLabel}</span>
        <span aria-hidden="true" className="text-muted-foreground">
          ▾
        </span>
      </button>
      {isOpen && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1 w-full rounded-lg border border-border bg-background py-1 shadow-lg"
        >
          {OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted ${
                  option.value === value ? "font-semibold text-foreground" : "text-muted-foreground"
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
