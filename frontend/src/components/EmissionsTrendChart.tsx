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
import type { MonthlyTrend } from "@/types/api";

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

function readCssVar(name: string): string {
  // Canvas can't read CSS variables directly; getComputedStyle needs `document`,
  // which isn't available during SSR — the fallback never actually paints.
  if (typeof window === "undefined") return "#000000";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function EmissionsTrendChart({ trends }: { trends: MonthlyTrend[] }) {
  const { data, options } = useMemo(() => {
    const primary = readCssVar("--primary");
    const border = readCssVar("--border");
    const mutedForeground = readCssVar("--muted-foreground");

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
  }, [trends]);

  return (
    <div className="h-64 w-full min-w-120">
      <Bar data={data} options={options} />
    </div>
  );
}
