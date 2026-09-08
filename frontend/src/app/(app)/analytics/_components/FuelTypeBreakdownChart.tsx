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
import { useTheme } from "next-themes";
import { Bar } from "react-chartjs-2";
import type { FuelBreakdown } from "@/types/api";
import { useThemeCssVars } from "@/components/chartColors";
import { formatCo2e, FUEL_COLORS, FUEL_LABELS } from "./formatters";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const FUEL_COLOR_VARS = [...new Set(Object.values(FUEL_COLORS))].concat([
  "--muted-foreground",
  "--border",
]);

export function FuelTypeBreakdownChart({ breakdown }: { breakdown: FuelBreakdown[] }) {
  const { resolvedTheme } = useTheme();
  const colors = useThemeCssVars(FUEL_COLOR_VARS);

  const { data, options } = useMemo(() => {
    const mutedForeground = colors["--muted-foreground"];
    const border = colors["--border"];

    return {
      data: {
        labels: breakdown.map((entry) => FUEL_LABELS[entry.fuelType]),
        datasets: [
          {
            label: "CO2e (kg)",
            data: breakdown.map((entry) => entry.co2eKg),
            backgroundColor: breakdown.map((entry) => colors[FUEL_COLORS[entry.fuelType]]),
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
  }, [breakdown, colors]);

  return (
    <div className="h-64 w-full min-w-80">
      <Bar key={resolvedTheme} data={data} options={options} />
    </div>
  );
}
