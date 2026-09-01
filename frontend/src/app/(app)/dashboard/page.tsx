"use client";

import { useQuery } from "@tanstack/react-query";
import { getSummary, getTrends } from "@/services/analyticsApi";
import { EmissionsTrendChart } from "./_components/EmissionsTrendChart";
import { KpiCard } from "./_components/KpiCard";
import { computeDelta, formatCo2e } from "./_components/formatters";

function SkeletonCard() {
  return <div className="h-32 animate-pulse rounded-xl border border-border bg-muted" />;
}

export default function DashboardPage() {
  const summaryQuery = useQuery({ queryKey: ["analytics", "summary"], queryFn: getSummary });
  const trendsQuery = useQuery({ queryKey: ["analytics", "trends"], queryFn: getTrends });

  const trends = trendsQuery.data;
  const current = trends && trends.length >= 2 ? trends.at(-1) : undefined;
  const previous = trends && trends.length >= 2 ? trends.at(-2) : undefined;
  const co2eDelta = current && previous ? computeDelta(current.co2eKg, previous.co2eKg) : null;
  const tripCountDelta =
    current && previous ? computeDelta(current.tripCount, previous.tripCount) : null;

  return (
    <div className="p-6 md:p-8 space-y-8">
      <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>

      {summaryQuery.isError ? (
        <p className="text-sm text-destructive">Couldn&apos;t load this month&apos;s summary.</p>
      ) : !summaryQuery.data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard
            label="Total CO2e (This Month)"
            value={formatCo2e(summaryQuery.data.totalCo2eKg).value}
            unit={formatCo2e(summaryQuery.data.totalCo2eKg).unit}
            delta={co2eDelta}
            deltaTone="emissions"
          />
          <KpiCard
            label="Trips Logged (This Month)"
            value={String(summaryQuery.data.tripCount)}
            unit="trips"
            delta={tripCountDelta}
            deltaTone="neutral"
          />
        </div>
      )}

      <div className="rounded-xl border border-border bg-background p-6">
        <h3 className="text-lg font-semibold text-foreground">Monthly Emissions Trend</h3>
        <p className="text-sm text-muted-foreground mb-6">Carbon output year to date</p>

        {trendsQuery.isError ? (
          <p className="text-sm text-destructive">Couldn&apos;t load the emissions trend.</p>
        ) : !trends ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : trends.every((trend) => trend.co2eKg === 0) ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No emissions data yet — log a trip to see trends here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <EmissionsTrendChart trends={trends} />
          </div>
        )}
      </div>
    </div>
  );
}
