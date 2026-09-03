"use client";

import { useQuery } from "@tanstack/react-query";
import { getByTransport, getTrends } from "@/services/analyticsApi";
import { EmissionsTrendChart } from "@/components/EmissionsTrendChart";
import { TransportBreakdownChart } from "./_components/TransportBreakdownChart";

export default function AnalyticsPage() {
  const breakdownQuery = useQuery({
    queryKey: ["analytics", "by-transport"],
    queryFn: getByTransport,
  });
  const trendsQuery = useQuery({ queryKey: ["analytics", "trends"], queryFn: getTrends });

  const breakdown = breakdownQuery.data;
  const trends = trendsQuery.data;

  return (
    <div className="p-6 md:p-8 space-y-8">
      <h2 className="text-2xl font-semibold text-foreground">Analytics</h2>

      <div className="rounded-xl border border-border bg-background p-6">
        <h3 className="text-lg font-semibold text-foreground">
          Emissions by Transport Mode (This Month)
        </h3>
        <p className="text-sm text-muted-foreground mb-6">Share of CO2e by travel mode</p>

        {breakdownQuery.isError ? (
          <p className="text-sm text-destructive">Couldn&apos;t load the transport breakdown.</p>
        ) : !breakdown ? (
          <div className="h-48 animate-pulse rounded-lg bg-muted" />
        ) : breakdown.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No emissions data yet — log a trip to see your breakdown here.
          </p>
        ) : (
          <TransportBreakdownChart breakdown={breakdown} />
        )}
      </div>

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
