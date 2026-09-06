"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getByFuelType,
  getByTransport,
  getQuarterlyComparison,
  getTrends,
} from "@/services/analyticsApi";
import { EmissionsTrendChart } from "@/components/EmissionsTrendChart";
import { EfficiencyByModeChart } from "./_components/EfficiencyByModeChart";
import { FuelTypeBreakdownChart } from "./_components/FuelTypeBreakdownChart";
import { QuarterlyComparisonChart } from "./_components/QuarterlyComparisonChart";
import { TransportBreakdownChart } from "./_components/TransportBreakdownChart";

export default function AnalyticsPage() {
  const breakdownQuery = useQuery({
    queryKey: ["analytics", "by-transport"],
    queryFn: getByTransport,
  });
  const fuelBreakdownQuery = useQuery({
    queryKey: ["analytics", "by-fuel-type"],
    queryFn: getByFuelType,
  });
  const trendsQuery = useQuery({ queryKey: ["analytics", "trends"], queryFn: getTrends });
  const quarterlyQuery = useQuery({
    queryKey: ["analytics", "quarterly-comparison"],
    queryFn: getQuarterlyComparison,
  });

  const breakdown = breakdownQuery.data;
  const fuelBreakdown = fuelBreakdownQuery.data;
  const trends = trendsQuery.data;
  const quarterly = quarterlyQuery.data;

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
        <h3 className="text-lg font-semibold text-foreground">Efficiency by Transport Mode</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Carbon cost per kilometer or per passenger — the lower the bar, the more efficient the
          mode
        </p>

        {breakdownQuery.isError ? (
          <p className="text-sm text-destructive">Couldn&apos;t load the efficiency breakdown.</p>
        ) : !breakdown ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : breakdown.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No emissions data yet — log a trip to see efficiency here.
          </p>
        ) : (
          <EfficiencyByModeChart breakdown={breakdown} />
        )}
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <h3 className="text-lg font-semibold text-foreground">Emissions by Fuel Type</h3>
        <p className="text-sm text-muted-foreground mb-6">Car trips this month, by fuel type</p>

        {fuelBreakdownQuery.isError ? (
          <p className="text-sm text-destructive">Couldn&apos;t load the fuel type breakdown.</p>
        ) : !fuelBreakdown ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : fuelBreakdown.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No car trips logged this month.
          </p>
        ) : (
          <FuelTypeBreakdownChart breakdown={fuelBreakdown} />
        )}
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <h3 className="text-lg font-semibold text-foreground">Year-over-Year Emissions</h3>
        <p className="text-sm text-muted-foreground mb-6">This year vs. last year, by quarter</p>

        {quarterlyQuery.isError ? (
          <p className="text-sm text-destructive">Couldn&apos;t load the yearly comparison.</p>
        ) : !quarterly ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : quarterly.every(
            (entry) => entry.currentYearCo2eKg === 0 && entry.previousYearCo2eKg === 0,
          ) ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No emissions data yet — log a trip to see year-over-year comparisons here.
          </p>
        ) : (
          <QuarterlyComparisonChart comparison={quarterly} />
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
