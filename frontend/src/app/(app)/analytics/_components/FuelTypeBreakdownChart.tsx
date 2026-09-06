"use client";

import { useMemo } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { FuelBreakdown } from "@/types/api";
import { formatCo2e, FUEL_COLORS, FUEL_LABELS } from "./formatters";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

function readCssVar(name: string): string {
  if (typeof window === "undefined") return "#000000";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function FuelTypeBreakdownChart({ breakdown }: { breakdown: FuelBreakdown[] }) {
  const { data, options } = useMemo(() => {
    const mutedForeground = readCssVar("--muted-foreground");
    const border = readCssVar("--border");

    return {
      data: {
        labels: breakdown.map((entry) => FUEL_LABELS[entry.fuelType]),
        datasets: [
          {
            label: "CO2e (kg)",
            data: breakdown.map((entry) => entry.co2eKg),
            backgroundColor: breakdown.map((entry) => readCssVar(FUEL_COLORS[entry.fuelType])),
            borderRadius: 4,
            maxBarThickness: 48,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: TooltipItem<"bar">) => {
                const entry = breakdown[ctx.dataIndex];
                const formatted = formatCo2e(entry.co2eKg);
                return `${formatted.value} ${formatted.unit} CO2e · ${entry.tripCount} ${entry.tripCount === 1 ? "trip" : "trips"}`;
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: mutedForeground } },
          y: { beginAtZero: true, grid: { color: border }, ticks: { color: mutedForeground } },
        },
      },
    };
  }, [breakdown]);

  return (
    <div className="h-64 w-full min-w-80">
      <Bar data={data} options={options} />
    </div>
  );
}
