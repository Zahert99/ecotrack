import { Pool, PoolClient } from 'pg';

export type TransportType = 'CAR' | 'BUS' | 'TRAIN' | 'FLIGHT';
export type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';

export interface Trip {
  id: string;
  userId: string;
  companyId: string;
  transportType: TransportType;
  fuelType: FuelType | null;
  distanceKm: number;
  passengerCount: number;
  co2eKg: number;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TripRow {
  id: string;
  user_id: string;
  company_id: string;
  transport_type: TransportType;
  fuel_type: FuelType | null;
  distance_km: string;
  passenger_count: number;
  co2e_kg: string;
  date: string;
  created_at: Date;
  updated_at: Date;
}

function toTrip(row: TripRow): Trip {
  return {
    id: row.id,
    userId: row.user_id,
    companyId: row.company_id,
    transportType: row.transport_type,
    fuelType: row.fuel_type,
    distanceKm: Number(row.distance_km),
    passengerCount: row.passenger_count,
    co2eKg: Number(row.co2e_kg),
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT_COLUMNS = `id, user_id, company_id, transport_type, fuel_type, distance_km,
  passenger_count, co2e_kg, date, created_at, updated_at`;

export async function insertTrip(
  client: Pool | PoolClient,
  companyId: string,
  params: {
    userId: string;
    transportType: TransportType;
    fuelType: FuelType | null;
    distanceKm: number;
    passengerCount: number;
    co2eKg: number;
    date: string;
  },
): Promise<Trip> {
  const result = await client.query<TripRow>(
    `INSERT INTO trips
       (user_id, company_id, transport_type, fuel_type, distance_km, passenger_count, co2e_kg, date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${SELECT_COLUMNS}`,
    [
      params.userId,
      companyId,
      params.transportType,
      params.fuelType,
      params.distanceKm,
      params.passengerCount,
      params.co2eKg,
      params.date,
    ],
  );
  return toTrip(result.rows[0]);
}

export async function findTripById(
  client: Pool | PoolClient,
  companyId: string,
  tripId: string,
): Promise<Trip | null> {
  const result = await client.query<TripRow>(
    `SELECT ${SELECT_COLUMNS} FROM trips WHERE company_id = $1 AND id = $2`,
    [companyId, tripId],
  );
  return result.rows[0] ? toTrip(result.rows[0]) : null;
}

export async function listTripsForCompany(
  client: Pool | PoolClient,
  companyId: string,
): Promise<Trip[]> {
  const result = await client.query<TripRow>(
    `SELECT ${SELECT_COLUMNS} FROM trips WHERE company_id = $1 ORDER BY date DESC, created_at DESC`,
    [companyId],
  );
  return result.rows.map(toTrip);
}

export async function listTripsForUser(
  client: Pool | PoolClient,
  companyId: string,
  userId: string,
): Promise<Trip[]> {
  const result = await client.query<TripRow>(
    `SELECT ${SELECT_COLUMNS} FROM trips
     WHERE company_id = $1 AND user_id = $2
     ORDER BY date DESC, created_at DESC`,
    [companyId, userId],
  );
  return result.rows.map(toTrip);
}

export async function findTripsByIds(
  client: Pool | PoolClient,
  companyId: string,
  tripIds: string[],
): Promise<Trip[]> {
  if (tripIds.length === 0) {
    return [];
  }
  const result = await client.query<TripRow>(
    `SELECT ${SELECT_COLUMNS} FROM trips WHERE company_id = $1 AND id = ANY($2::uuid[])`,
    [companyId, tripIds],
  );
  return result.rows.map(toTrip);
}

export async function updateTrip(
  client: Pool | PoolClient,
  companyId: string,
  tripId: string,
  params: {
    transportType: TransportType;
    fuelType: FuelType | null;
    distanceKm: number;
    passengerCount: number;
    co2eKg: number;
    date: string;
  },
): Promise<Trip | null> {
  const result = await client.query<TripRow>(
    `UPDATE trips
     SET transport_type = $3, fuel_type = $4, distance_km = $5,
         passenger_count = $6, co2e_kg = $7, date = $8, updated_at = NOW()
     WHERE company_id = $1 AND id = $2
     RETURNING ${SELECT_COLUMNS}`,
    [
      companyId,
      tripId,
      params.transportType,
      params.fuelType,
      params.distanceKm,
      params.passengerCount,
      params.co2eKg,
      params.date,
    ],
  );
  return result.rows[0] ? toTrip(result.rows[0]) : null;
}

export async function deleteTrip(
  client: Pool | PoolClient,
  companyId: string,
  tripId: string,
): Promise<boolean> {
  const result = await client.query('DELETE FROM trips WHERE company_id = $1 AND id = $2', [
    companyId,
    tripId,
  ]);
  return (result.rowCount ?? 0) > 0;
}
