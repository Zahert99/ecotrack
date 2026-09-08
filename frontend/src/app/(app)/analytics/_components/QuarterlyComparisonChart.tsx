"use client";

import { useMemo } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { useTheme } from "next-themes";
import { Bar } from "react-chartjs-2";
import type { QuarterlyComparison } from "@/types/api";
import { useThemeCssVars } from "@/components/chartColors";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const COLOR_VARS = ["--primary", "--muted-foreground", "--border"];

export function QuarterlyComparisonChart({
  comparison,
}: {
  comparison: QuarterlyComparison[];
}) {
  const { resolvedTheme } = useTheme();
  const colors = useThemeCssVars(COLOR_VARS);

  const { data, options } = useMemo(() => {
    const primary = colors["--primary"];
    const mutedForeground = colors["--muted-foreground"];
    const border = colors["--border"];

    return {
      data: {
        labels: comparison.map((entry) => entry.quarter),
        datasets: [
          {
            label: "This Year",
            data: comparison.map((entry) => entry.currentYearCo2eKg),
            backgroundColor: primary,
            borderRadius: 4,
            maxBarThickness: 32,
          },
          {
            label: "Last Year",
            data: comparison.map((entry) => entry.previousYearCo2eKg),
            backgroundColor: mutedForeground,
            borderRadius: 4,
            maxBarThickness: 32,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top" as const,
            labels: { color: mutedForeground, boxWidth: 12 },
          },
          tooltip: {
            callbacks: {
              label: (ctx: TooltipItem<"bar">) =>
                `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString()} kg CO2e`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: mutedForeground } },
          y: {
            beginAtZero: true,
            grid: { color: border },
            ticks: { color: mutedForeground },
          },
        },
      },
    };
  }, [comparison, colors]);

  return (
    <div className='h-64 w-full min-w-80'>
      <Bar key={resolvedTheme} data={data} options={options} />
    </div>
  );
}
