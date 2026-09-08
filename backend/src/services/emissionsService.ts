import { Pool, PoolClient } from 'pg';
import { findEmissionFactor } from '../repositories/emissionFactorRepository';
import { FuelType, TransportType } from '../repositories/tripRepository';
import { HttpError } from '../middleware/errorHandler';

export async function calculateCo2eKg(
  client: Pool | PoolClient,
  transportType: TransportType,
  fuelType: FuelType | null,
  distanceKm: number,
  passengerCount: number = 1,
): Promise<number> {
  const factor = await findEmissionFactor(client, transportType, fuelType);
  if (factor === null) {
    throw new HttpError(
      400,
      'NO_EMISSION_FACTOR',
      `No emission factor configured for ${transportType}${fuelType ? `/${fuelType}` : ''}`,
    );
  }
  const calculated =
    factor.unit === 'passenger_km'
      ? distanceKm * passengerCount * factor.factorKgPerKm
      : distanceKm * factor.factorKgPerKm;
  return Math.round(calculated * 10000) / 10000;
}
