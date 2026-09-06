import { Pool, PoolClient } from 'pg';
import { FuelType, TransportType } from './tripRepository';

export interface MonthlySummary {
  totalCo2eKg: number;
  tripCount: number;
}

export interface TransportBreakdown {
  transportType: TransportType;
  co2eKg: number;
  tripCount: number;
  distanceKm: number;
  passengerCount: number;
}

export interface FuelBreakdown {
  fuelType: FuelType;
  co2eKg: number;
  tripCount: number;
}

export interface MonthlyTrend {
  month: string;
  co2eKg: number;
  tripCount: number;
}

export interface QuarterlyComparison {
  quarter: string;
  currentYearCo2eKg: number;
  previousYearCo2eKg: number;
}

const CURRENT_MONTH_FILTER = `
  date >= date_trunc('month', CURRENT_DATE)::date
  AND date < (date_trunc('month', CURRENT_DATE) + interval '1 month')::date
`;

export async function getMonthlySummary(
  client: Pool | PoolClient,
  companyId: string,
  userId: string | null,
): Promise<MonthlySummary> {
  const result = await client.query<{ total_co2e_kg: string; trip_count: string }>(
    `SELECT COALESCE(SUM(co2e_kg), 0) AS total_co2e_kg, COUNT(*) AS trip_count
     FROM trips
     WHERE company_id = $1
       AND ($2::uuid IS NULL OR user_id = $2)
       AND ${CURRENT_MONTH_FILTER}`,
    [companyId, userId],
  );
  const row = result.rows[0];
  return {
    totalCo2eKg: Number(row.total_co2e_kg),
    tripCount: Number(row.trip_count),
  };
}

export async function getBreakdownByTransport(
  client: Pool | PoolClient,
  companyId: string,
  userId: string | null,
): Promise<TransportBreakdown[]> {
  const result = await client.query<{
    transport_type: TransportType;
    co2e_kg: string;
    trip_count: string;
    distance_km: string;
    passenger_count: string;
  }>(
    `SELECT transport_type,
            COALESCE(SUM(co2e_kg), 0) AS co2e_kg,
            COUNT(*) AS trip_count,
            COALESCE(SUM(distance_km), 0) AS distance_km,
            COALESCE(SUM(passenger_count), 0) AS passenger_count
     FROM trips
     WHERE company_id = $1
       AND ($2::uuid IS NULL OR user_id = $2)
       AND ${CURRENT_MONTH_FILTER}
     GROUP BY transport_type
     ORDER BY co2e_kg DESC`,
    [companyId, userId],
  );
  return result.rows.map((row) => ({
    transportType: row.transport_type,
    co2eKg: Number(row.co2e_kg),
    tripCount: Number(row.trip_count),
    distanceKm: Number(row.distance_km),
    passengerCount: Number(row.passenger_count),
  }));
}

export async function getBreakdownByFuelType(
  client: Pool | PoolClient,
  companyId: string,
  userId: string | null,
): Promise<FuelBreakdown[]> {
  const result = await client.query<{
    fuel_type: FuelType;
    co2e_kg: string;
    trip_count: string;
  }>(
    `SELECT fuel_type, COALESCE(SUM(co2e_kg), 0) AS co2e_kg, COUNT(*) AS trip_count
     FROM trips
     WHERE company_id = $1
       AND transport_type = 'CAR'
       AND ($2::uuid IS NULL OR user_id = $2)
       AND ${CURRENT_MONTH_FILTER}
     GROUP BY fuel_type
     ORDER BY co2e_kg DESC`,
    [companyId, userId],
  );
  return result.rows.map((row) => ({
    fuelType: row.fuel_type,
    co2eKg: Number(row.co2e_kg),
    tripCount: Number(row.trip_count),
  }));
}

export async function getMonthlyTrends(
  client: Pool | PoolClient,
  companyId: string,
  userId: string | null,
): Promise<MonthlyTrend[]> {
  const result = await client.query<{ month: string; co2e_kg: string; trip_count: string }>(
    `SELECT
       to_char(gs.month_start, 'YYYY-MM') AS month,
       COALESCE(SUM(t.co2e_kg), 0) AS co2e_kg,
       COUNT(t.id) AS trip_count
     FROM generate_series(
       date_trunc('year', CURRENT_DATE),
       date_trunc('month', CURRENT_DATE),
       interval '1 month'
     ) AS gs(month_start)
     LEFT JOIN trips t
       ON t.company_id = $1
       AND ($2::uuid IS NULL OR t.user_id = $2)
       AND date_trunc('month', t.date) = gs.month_start
     GROUP BY gs.month_start
     ORDER BY gs.month_start`,
    [companyId, userId],
  );
  return result.rows.map((row) => ({
    month: row.month,
    co2eKg: Number(row.co2e_kg),
    tripCount: Number(row.trip_count),
  }));
}

export async function getQuarterlyComparison(
  client: Pool | PoolClient,
  companyId: string,
  userId: string | null,
): Promise<QuarterlyComparison[]> {
  const result = await client.query<{ quarter: number; year: number; co2e_kg: string }>(
    `SELECT
       EXTRACT(QUARTER FROM gs.quarter_start)::int AS quarter,
       EXTRACT(YEAR FROM gs.quarter_start)::int AS year,
       COALESCE(SUM(t.co2e_kg), 0) AS co2e_kg
     FROM generate_series(
       date_trunc('year', CURRENT_DATE) - interval '1 year',
       date_trunc('year', CURRENT_DATE) + interval '9 months',
       interval '3 months'
     ) AS gs(quarter_start)
     LEFT JOIN trips t
       ON t.company_id = $1
       AND ($2::uuid IS NULL OR t.user_id = $2)
       AND date_trunc('quarter', t.date) = gs.quarter_start
     GROUP BY gs.quarter_start
     ORDER BY gs.quarter_start`,
    [companyId, userId],
  );

  const currentYear = new Date().getUTCFullYear();
  const byQuarter = new Map<number, QuarterlyComparison>();
  for (let quarter = 1; quarter <= 4; quarter += 1) {
    byQuarter.set(quarter, { quarter: `Q${quarter}`, currentYearCo2eKg: 0, previousYearCo2eKg: 0 });
  }
  for (const row of result.rows) {
    const entry = byQuarter.get(row.quarter);
    if (!entry) continue;
    if (row.year === currentYear) {
      entry.currentYearCo2eKg = Number(row.co2e_kg);
    } else {
      entry.previousYearCo2eKg = Number(row.co2e_kg);
    }
  }
  return Array.from(byQuarter.values());
}
