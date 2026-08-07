import { Pool, PoolClient } from 'pg';
import { FuelType, TransportType } from './tripRepository';

export async function findEmissionFactor(
  client: Pool | PoolClient,
  transportType: TransportType,
  fuelType: FuelType | null,
): Promise<number | null> {
  const result = await client.query<{ factor_kg_per_km: string }>(
    `SELECT factor_kg_per_km FROM emission_factors
     WHERE transport_type = $1
       AND fuel_type IS NOT DISTINCT FROM $2`,
    [transportType, fuelType],
  );
  return result.rows[0] ? Number(result.rows[0].factor_kg_per_km) : null;
}
