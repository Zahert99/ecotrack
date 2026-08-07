import { Pool, PoolClient } from 'pg';
import { TransportType } from './tripRepository';

export interface MonthlySummary {
  totalCo2eKg: number;
  tripCount: number;
}

export interface TransportBreakdown {
  transportType: TransportType;
  co2eKg: number;
  tripCount: number;
}

export interface MonthlyTrend {
  month: string;
  co2eKg: number;
  tripCount: number;
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
  }>(
    `SELECT transport_type, COALESCE(SUM(co2e_kg), 0) AS co2e_kg, COUNT(*) AS trip_count
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
