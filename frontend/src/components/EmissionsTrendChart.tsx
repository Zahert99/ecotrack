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
import type { MonthlyTrend } from "@/types/api";
import { useThemeCssVars } from "./chartColors";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatMonthLabel(month: string): string {
  const [, monthNumber] = month.split("-");
  const index = Number(monthNumber) - 1;
  return MONTH_LABELS[index] ?? month;
}

export function EmissionsTrendChart({ trends }: { trends: MonthlyTrend[] }) {
  const { resolvedTheme } = useTheme();
  const colors = useThemeCssVars(["--primary", "--border", "--muted-foreground"]);

  const { data, options } = useMemo(() => {
    const primary = colors["--primary"];
    const border = colors["--border"];
    const mutedForeground = colors["--muted-foreground"];

    return {
      data: {
        labels: trends.map((trend) => formatMonthLabel(trend.month)),
        datasets: [
          {
            label: "CO2e (kg)",
            data: trends.map((trend) => trend.co2eKg),
            backgroundColor: primary,
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
              label: (ctx: TooltipItem<"bar">) =>
                `${(ctx.parsed.y ?? 0).toLocaleString()} kg CO2e`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: mutedForeground },
          },
          y: {
            beginAtZero: true,
            grid: { color: border },
            ticks: { color: mutedForeground },
          },
        },
      },
    };
  }, [trends, colors]);

  return (
    <div className="h-64 w-full min-w-120">
      <Bar key={resolvedTheme} data={data} options={options} />
    </div>
  );
}
