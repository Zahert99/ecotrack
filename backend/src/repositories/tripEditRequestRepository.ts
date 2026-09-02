import { Pool, PoolClient } from 'pg';
import { FuelType, TransportType } from './tripRepository';

export type TripEditRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TripEditRequest {
  id: string;
  tripId: string;
  companyId: string;
  requestedBy: string;
  status: TripEditRequestStatus;
  proposedTransportType: TransportType;
  proposedFuelType: FuelType | null;
  proposedDistanceKm: number;
  proposedPassengerCount: number;
  proposedDate: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TripEditRequestRow {
  id: string;
  trip_id: string;
  company_id: string;
  requested_by: string;
  status: TripEditRequestStatus;
  proposed_transport_type: TransportType;
  proposed_fuel_type: FuelType | null;
  proposed_distance_km: string;
  proposed_passenger_count: number;
  proposed_date: string;
  created_at: Date;
  updated_at: Date;
}

const SELECT_COLUMNS = `id, trip_id, company_id, requested_by, status, proposed_transport_type,
  proposed_fuel_type, proposed_distance_km, proposed_passenger_count, proposed_date,
  created_at, updated_at`;

function toTripEditRequest(row: TripEditRequestRow): TripEditRequest {
  return {
    id: row.id,
    tripId: row.trip_id,
    companyId: row.company_id,
    requestedBy: row.requested_by,
    status: row.status,
    proposedTransportType: row.proposed_transport_type,
    proposedFuelType: row.proposed_fuel_type,
    proposedDistanceKm: Number(row.proposed_distance_km),
    proposedPassengerCount: row.proposed_passenger_count,
    proposedDate: row.proposed_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function insertTripEditRequest(
  client: Pool | PoolClient,
  params: {
    tripId: string;
    companyId: string;
    requestedBy: string;
    transportType: TransportType;
    fuelType: FuelType | null;
    distanceKm: number;
    passengerCount: number;
    date: string;
  },
): Promise<TripEditRequest> {
  const result = await client.query<TripEditRequestRow>(
    `INSERT INTO trip_edit_requests
       (trip_id, company_id, requested_by, proposed_transport_type, proposed_fuel_type,
        proposed_distance_km, proposed_passenger_count, proposed_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${SELECT_COLUMNS}`,
    [
      params.tripId,
      params.companyId,
      params.requestedBy,
      params.transportType,
      params.fuelType,
      params.distanceKm,
      params.passengerCount,
      params.date,
    ],
  );
  return toTripEditRequest(result.rows[0]);
}

export async function findLatestTripEditRequestForRequester(
  client: Pool | PoolClient,
  companyId: string,
  tripId: string,
  requestedBy: string,
): Promise<TripEditRequest | null> {
  const result = await client.query<TripEditRequestRow>(
    `SELECT ${SELECT_COLUMNS} FROM trip_edit_requests
     WHERE company_id = $1 AND trip_id = $2 AND requested_by = $3
     ORDER BY created_at DESC
     LIMIT 1`,
    [companyId, tripId, requestedBy],
  );
  return result.rows[0] ? toTripEditRequest(result.rows[0]) : null;
}

export async function listPendingTripEditRequestsForCompany(
  client: Pool | PoolClient,
  companyId: string,
): Promise<TripEditRequest[]> {
  const result = await client.query<TripEditRequestRow>(
    `SELECT ${SELECT_COLUMNS} FROM trip_edit_requests
     WHERE company_id = $1 AND status = 'PENDING'
     ORDER BY created_at ASC`,
    [companyId],
  );
  return result.rows.map(toTripEditRequest);
}

export async function findTripEditRequestById(
  client: Pool | PoolClient,
  companyId: string,
  id: string,
): Promise<TripEditRequest | null> {
  const result = await client.query<TripEditRequestRow>(
    `SELECT ${SELECT_COLUMNS} FROM trip_edit_requests WHERE company_id = $1 AND id = $2`,
    [companyId, id],
  );
  return result.rows[0] ? toTripEditRequest(result.rows[0]) : null;
}

export async function resolveTripEditRequest(
  client: Pool | PoolClient,
  companyId: string,
  id: string,
  status: 'APPROVED' | 'REJECTED',
): Promise<TripEditRequest | null> {
  const result = await client.query<TripEditRequestRow>(
    `UPDATE trip_edit_requests
     SET status = $3, updated_at = NOW()
     WHERE company_id = $1 AND id = $2 AND status = 'PENDING'
     RETURNING ${SELECT_COLUMNS}`,
    [companyId, id, status],
  );
  return result.rows[0] ? toTripEditRequest(result.rows[0]) : null;
}
