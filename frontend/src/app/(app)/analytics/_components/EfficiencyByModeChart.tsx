"use client";

import { useMemo, useState } from "react";
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
import type { TransportBreakdown } from "@/types/api";
import { useThemeCssVars } from "@/components/chartColors";
import { TRANSPORT_LABELS } from "./formatters";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

type EfficiencyMetric = "perKm" | "perPassenger";

const COLOR_VARS = ["--primary", "--secondary", "--muted-foreground", "--border"];

export function EfficiencyByModeChart({ breakdown }: { breakdown: TransportBreakdown[] }) {
  const [metric, setMetric] = useState<EfficiencyMetric>("perKm");
  const { resolvedTheme } = useTheme();
  const colors = useThemeCssVars(COLOR_VARS);

  const { data, options } = useMemo(() => {
    const values = breakdown.map((entry) =>
      metric === "perKm" ? entry.co2eKg / entry.distanceKm : entry.co2eKg / entry.passengerCount,
    );
    const barColor = colors[metric === "perKm" ? "--primary" : "--secondary"];
    const mutedForeground = colors["--muted-foreground"];
    const border = colors["--border"];
    const unit = metric === "perKm" ? "kg/km" : "kg/passenger";

    return {
      data: {
        labels: breakdown.map((entry) => TRANSPORT_LABELS[entry.transportType]),
        datasets: [
          {
            label: unit,
            data: values,
            backgroundColor: barColor,
            borderRadius: 4,
            maxBarThickness: 40,
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
              label: (ctx: TooltipItem<"bar">) => `${(ctx.parsed.y ?? 0).toFixed(2)} ${unit}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: mutedForeground } },
          y: { beginAtZero: true, grid: { color: border }, ticks: { color: mutedForeground } },
        },
      },
    };
  }, [breakdown, metric, colors]);

  return (
    <div>
      <div className="mb-4 flex justify-end gap-1 rounded-lg bg-muted p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setMetric("perKm")}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            metric === "perKm"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Per km
        </button>
        <button
          type="button"
          onClick={() => setMetric("perPassenger")}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            metric === "perPassenger"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Per passenger
        </button>
      </div>
      <div className="h-64 w-full min-w-80">
        <Bar key={resolvedTheme} data={data} options={options} />
      </div>
    </div>
  );
}
