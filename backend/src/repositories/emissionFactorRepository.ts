import { Pool, PoolClient } from 'pg';
import { FuelType, TransportType } from './tripRepository';

export interface EmissionFactor {
  factorKgPerKm: number;
  unit: 'vehicle_km' | 'passenger_km';
}

export async function findEmissionFactor(
  client: Pool | PoolClient,
  transportType: TransportType,
  fuelType: FuelType | null,
): Promise<EmissionFactor | null> {
  const result = await client.query<{ factor_kg_per_km: string; unit: string }>(
    `SELECT factor_kg_per_km, unit FROM emission_factors
     WHERE transport_type = $1
       AND fuel_type IS NOT DISTINCT FROM $2`,
    [transportType, fuelType],
  );
  const row = result.rows[0];
  return row
    ? { factorKgPerKm: Number(row.factor_kg_per_km), unit: row.unit as EmissionFactor['unit'] }
    : null;
}
