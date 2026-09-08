import { pool } from '../database/pool';
import { HttpError } from '../middleware/errorHandler';
import {
  deleteTrip as deleteTripRow,
  findTripById,
  FuelType,
  insertTrip,
  listTripsForCompany,
  listTripsForUser,
  TransportType,
  Trip,
  updateTrip as updateTripRow,
} from '../repositories/tripRepository';
import { UserRole } from '../repositories/userRepository';
import { calculateCo2eKg } from './emissionsService';
import { resolveCompanyScope } from './scopeResolver';

interface Requester {
  userId: string;
  role: UserRole;
  canViewCompanyData: boolean;
}

interface TripInput {
  transportType: TransportType;
  fuelType: FuelType | null;
  distanceKm: number;
  passengerCount: number;
  date: string;
}

async function assertAccessible(
  companyId: string,
  requester: Requester,
  tripId: string,
  mode: 'read' | 'write' = 'write',
): Promise<Trip> {
  const trip = await findTripById(pool, companyId, tripId);
  if (!trip) {
    throw new HttpError(404, 'TRIP_NOT_FOUND', 'Trip not found');
  }
  const isOwner = trip.userId === requester.userId;
  const hasFullAccess =
    requester.role === 'ADMIN' || (mode === 'read' && resolveCompanyScope(requester) === null);
  if (!isOwner && !hasFullAccess) {
    throw new HttpError(403, 'FORBIDDEN', 'You do not have permission to access this trip');
  }
  return trip;
}

export async function createTrip(
  companyId: string,
  requester: Requester,
  input: TripInput,
): Promise<Trip> {
  const co2eKg = await calculateCo2eKg(
    pool,
    input.transportType,
    input.fuelType,
    input.distanceKm,
    input.passengerCount,
  );
  return insertTrip(pool, companyId, {
    userId: requester.userId,
    transportType: input.transportType,
    fuelType: input.fuelType,
    distanceKm: input.distanceKm,
    passengerCount: input.passengerCount,
    co2eKg,
    date: input.date,
  });
}

export async function listTrips(companyId: string, requester: Requester): Promise<Trip[]> {
  const scope = resolveCompanyScope(requester);
  if (scope === null) {
    return listTripsForCompany(pool, companyId);
  }
  return listTripsForUser(pool, companyId, scope);
}

export async function getTrip(
  companyId: string,
  requester: Requester,
  tripId: string,
): Promise<Trip> {
  return assertAccessible(companyId, requester, tripId, 'read');
}

export async function updateTrip(
  companyId: string,
  requester: Requester,
  tripId: string,
  input: TripInput,
): Promise<Trip> {
  await assertAccessible(companyId, requester, tripId);
  const co2eKg = await calculateCo2eKg(
    pool,
    input.transportType,
    input.fuelType,
    input.distanceKm,
    input.passengerCount,
  );
  const updated = await updateTripRow(pool, companyId, tripId, {
    transportType: input.transportType,
    fuelType: input.fuelType,
    distanceKm: input.distanceKm,
    passengerCount: input.passengerCount,
    co2eKg,
    date: input.date,
  });
  if (!updated) {
    throw new HttpError(404, 'TRIP_NOT_FOUND', 'Trip not found');
  }
  return updated;
}

export async function removeTrip(
  companyId: string,
  requester: Requester,
  tripId: string,
): Promise<void> {
  await assertAccessible(companyId, requester, tripId);
  await deleteTripRow(pool, companyId, tripId);
}
