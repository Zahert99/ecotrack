import { DatabaseError } from 'pg';
import { pool } from '../database/pool';
import { UNIQUE_VIOLATION } from '../database/pgErrorCodes';
import { withTransaction } from '../database/withTransaction';
import { HttpError } from '../middleware/errorHandler';
import {
  findLatestTripEditRequestForRequester,
  findTripEditRequestById,
  insertTripEditRequest,
  listPendingTripEditRequestsForCompany,
  resolveTripEditRequest,
  TripEditRequest,
} from '../repositories/tripEditRequestRepository';
import {
  findTripById,
  findTripsByIds,
  FuelType,
  TransportType,
  Trip,
  updateTrip,
} from '../repositories/tripRepository';
import { UserRole } from '../repositories/userRepository';
import { calculateCo2eKg } from './emissionsService';
import * as tripService from './tripService';

interface Requester {
  userId: string;
  role: UserRole;
  canViewCompanyData: boolean;
}

interface TripEditInput {
  transportType: TransportType;
  fuelType: FuelType | null;
  distanceKm: number;
  passengerCount: number;
  date: string;
}

export interface TripEditRequestWithTrip extends TripEditRequest {
  trip: Trip | null;
}

export async function proposeEdit(
  companyId: string,
  requester: Requester,
  tripId: string,
  input: TripEditInput,
): Promise<TripEditRequest> {
  const trip = await findTripById(pool, companyId, tripId);
  if (!trip) {
    throw new HttpError(404, 'TRIP_NOT_FOUND', 'Trip not found');
  }

  const isOwner = trip.userId === requester.userId;
  const canPropose = requester.role !== 'ADMIN' && requester.canViewCompanyData && !isOwner;
  if (!canPropose) {
    throw new HttpError(
      403,
      'FORBIDDEN',
      'You do not have permission to propose an edit to this trip',
    );
  }

  try {
    return await insertTripEditRequest(pool, {
      tripId,
      companyId,
      requestedBy: requester.userId,
      transportType: input.transportType,
      fuelType: input.fuelType,
      distanceKm: input.distanceKm,
      passengerCount: input.passengerCount,
      date: input.date,
    });
  } catch (err) {
    if (err instanceof DatabaseError && err.code === UNIQUE_VIOLATION) {
      throw new HttpError(
        409,
        'EDIT_REQUEST_ALREADY_PENDING',
        'This trip already has a pending edit request',
      );
    }
    throw err;
  }
}

export async function getMine(
  companyId: string,
  requester: Requester,
  tripId: string,
): Promise<TripEditRequest | null> {
  await tripService.getTrip(companyId, requester, tripId);
  return findLatestTripEditRequestForRequester(pool, companyId, tripId, requester.userId);
}

export async function listPending(companyId: string): Promise<TripEditRequestWithTrip[]> {
  const requests = await listPendingTripEditRequestsForCompany(pool, companyId);
  if (requests.length === 0) {
    return [];
  }
  const tripIds = [...new Set(requests.map((request) => request.tripId))];
  const trips = await findTripsByIds(pool, companyId, tripIds);
  const tripsById = new Map(trips.map((trip) => [trip.id, trip]));
  return requests.map((request) => ({ ...request, trip: tripsById.get(request.tripId) ?? null }));
}

export async function resolve(
  companyId: string,
  requestId: string,
  status: 'APPROVED' | 'REJECTED',
): Promise<TripEditRequest> {
  return withTransaction(async (client) => {
    const existing = await findTripEditRequestById(client, companyId, requestId);
    if (!existing) {
      throw new HttpError(404, 'EDIT_REQUEST_NOT_FOUND', 'Edit request not found');
    }
    if (existing.status !== 'PENDING') {
      throw new HttpError(
        409,
        'EDIT_REQUEST_ALREADY_RESOLVED',
        'This edit request has already been resolved',
      );
    }

    const resolved = await resolveTripEditRequest(client, companyId, requestId, status);
    if (!resolved) {
      throw new HttpError(
        409,
        'EDIT_REQUEST_ALREADY_RESOLVED',
        'This edit request has already been resolved',
      );
    }

    if (status === 'APPROVED') {
      const co2eKg = await calculateCo2eKg(
        client,
        existing.proposedTransportType,
        existing.proposedFuelType,
        existing.proposedDistanceKm,
        existing.proposedPassengerCount,
      );
      const updated = await updateTrip(client, companyId, existing.tripId, {
        transportType: existing.proposedTransportType,
        fuelType: existing.proposedFuelType,
        distanceKm: existing.proposedDistanceKm,
        passengerCount: existing.proposedPassengerCount,
        co2eKg,
        date: existing.proposedDate,
      });
      if (!updated) {
        throw new HttpError(404, 'TRIP_NOT_FOUND', 'Trip no longer exists');
      }
    }

    return resolved;
  });
}
