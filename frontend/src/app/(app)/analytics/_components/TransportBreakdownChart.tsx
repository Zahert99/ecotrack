"use client";

import { useMemo } from "react";
import {
  ArcElement,
  Chart as ChartJS,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { useTheme } from "next-themes";
import { Doughnut } from "react-chartjs-2";
import type { TransportBreakdown } from "@/types/api";
import { useThemeCssVars } from "@/components/chartColors";
import { formatCo2e, TRANSPORT_COLORS, TRANSPORT_LABELS } from "./formatters";

ChartJS.register(ArcElement, Tooltip);

const TRANSPORT_COLOR_VARS = Object.values(TRANSPORT_COLORS);

export function TransportBreakdownChart({
  breakdown,
}: {
  breakdown: TransportBreakdown[];
}) {
  const { resolvedTheme } = useTheme();
  const colors = useThemeCssVars(TRANSPORT_COLOR_VARS);
  const total = breakdown.reduce((sum, entry) => sum + entry.co2eKg, 0);

  const { data, options } = useMemo(() => {
    return {
      data: {
        labels: breakdown.map((entry) => TRANSPORT_LABELS[entry.transportType]),
        datasets: [
          {
            data: breakdown.map((entry) => entry.co2eKg),
            backgroundColor: breakdown.map(
              (entry) => colors[TRANSPORT_COLORS[entry.transportType]],
            ),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: TooltipItem<"doughnut">) =>
                `${(ctx.parsed ?? 0).toLocaleString()} kg CO2e`,
            },
          },
        },
      },
    };
  }, [breakdown, colors]);

  const totalFormatted = formatCo2e(total);

  return (
    <div className='flex flex-col items-center gap-6 md:flex-row md:items-start'>
      <div className='relative h-48 w-48 shrink-0'>
        <Doughnut key={resolvedTheme} data={data} options={options} />
        <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
          <span className='text-2xl font-semibold text-foreground'>
            {totalFormatted.value}
          </span>
          <span className='text-xs text-muted-foreground'>
            {totalFormatted.unit} CO2e
          </span>
        </div>
      </div>

      <ul className='w-full flex-1 space-y-3'>
        {breakdown.map((entry) => {
          const percent = total > 0 ? (entry.co2eKg / total) * 100 : 0;
          return (
            <li
              key={entry.transportType}
              className='flex items-center gap-3 text-sm'
            >
              <span
                aria-hidden='true'
                className='h-2.5 w-2.5 shrink-0 rounded-full'
                style={{
                  backgroundColor: `var(${TRANSPORT_COLORS[entry.transportType]})`,
                }}
              />
              <span className='flex-1 font-medium text-foreground'>
                {TRANSPORT_LABELS[entry.transportType]}
              </span>
              <span className='text-muted-foreground'>
                {formatCo2e(entry.co2eKg).value} {formatCo2e(entry.co2eKg).unit}{" "}
                · {entry.tripCount} {entry.tripCount === 1 ? "trip" : "trips"}
              </span>
              <span className='w-12 text-right font-semibold text-foreground'>
                {percent.toFixed(0)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
