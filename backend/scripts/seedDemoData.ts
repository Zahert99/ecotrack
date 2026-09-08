/*
 * Seeds a comprehensive demo dataset for 'testCompany1' so all analytics
 * views (YoY, MoM, by-transport, by-fuel-type, quarterly comparison) have
 * real data to render across last year (2025) and this year, up to today.
 *
 * Re-runnable: any existing 'testCompany1' company is deleted first (cascades
 * to its users/trips/trip_edit_requests), then fully regenerated.
 *
 * Usage: npm run seed:demo   (from backend/)
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { BCRYPT_COST } from '../src/config/passwordConfig';
import { pool } from '../src/database/pool';
import { withTransaction } from '../src/database/withTransaction';
import { insertCompany } from '../src/repositories/companyRepository';
import { FuelType, insertTrip, TransportType, Trip } from '../src/repositories/tripRepository';
import {
  insertUser,
  updateCanViewCompanyData,
  User,
  UserRole,
} from '../src/repositories/userRepository';
import { calculateCo2eKg } from '../src/services/emissionsService';
import { proposeEdit, resolve as resolveEditRequest } from '../src/services/tripEditRequestService';

const COMPANY_NAME = 'testCompany1';
const DEMO_PASSWORD = 'DemoPass123!';
const TRIPS_PER_MONTH = 5;

interface UserDef {
  key: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  canViewCompanyData: boolean;
}

const USER_DEFS: UserDef[] = [
  {
    key: 'anna',
    firstName: 'Anna',
    lastName: 'Andersson',
    role: 'ADMIN',
    canViewCompanyData: false,
  },
  { key: 'erik', firstName: 'Erik', lastName: 'Svensson', role: 'USER', canViewCompanyData: true },
  { key: 'lina', firstName: 'Lina', lastName: 'Karlsson', role: 'USER', canViewCompanyData: true },
  {
    key: 'johan',
    firstName: 'Johan',
    lastName: 'Nilsson',
    role: 'USER',
    canViewCompanyData: false,
  },
  {
    key: 'sara',
    firstName: 'Sara',
    lastName: 'Lindqvist',
    role: 'USER',
    canViewCompanyData: false,
  },
];

interface TripTemplate {
  transportType: TransportType;
  fuelType: FuelType | null;
  distanceKm: number;
  passengerCount: number;
}

// Covers all 4 transport types, all 4 CAR fuel types, passenger counts 1-5,
// and short commute / medium business trip / long flight distance bands.
const TEMPLATES: TripTemplate[] = [
  { transportType: 'CAR', fuelType: 'PETROL', distanceKm: 18, passengerCount: 1 },
  { transportType: 'CAR', fuelType: 'DIESEL', distanceKm: 180, passengerCount: 1 },
  { transportType: 'CAR', fuelType: 'HYBRID', distanceKm: 25, passengerCount: 2 },
  { transportType: 'CAR', fuelType: 'ELECTRIC', distanceKm: 220, passengerCount: 1 },
  { transportType: 'BUS', fuelType: null, distanceKm: 15, passengerCount: 3 },
  { transportType: 'BUS', fuelType: null, distanceKm: 120, passengerCount: 5 },
  { transportType: 'TRAIN', fuelType: null, distanceKm: 250, passengerCount: 1 },
  { transportType: 'TRAIN', fuelType: null, distanceKm: 300, passengerCount: 2 },
  { transportType: 'FLIGHT', fuelType: null, distanceKm: 800, passengerCount: 1 },
  { transportType: 'FLIGHT', fuelType: null, distanceKm: 1500, passengerCount: 2 },
  { transportType: 'CAR', fuelType: 'PETROL', distanceKm: 150, passengerCount: 4 },
  { transportType: 'CAR', fuelType: 'DIESEL', distanceKm: 35, passengerCount: 1 },
  { transportType: 'BUS', fuelType: null, distanceKm: 40, passengerCount: 2 },
  { transportType: 'TRAIN', fuelType: null, distanceKm: 60, passengerCount: 1 },
  { transportType: 'FLIGHT', fuelType: null, distanceKm: 2000, passengerCount: 3 },
  { transportType: 'CAR', fuelType: 'HYBRID', distanceKm: 100, passengerCount: 5 },
];

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function monthsFromLastYearToNow(now: Date): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  for (let year = 2025; year <= now.getFullYear(); year++) {
    const endMonth = year === now.getFullYear() ? now.getMonth() : 11;
    for (let month = 0; month <= endMonth; month++) {
      months.push({ year, month });
    }
  }
  return months;
}

async function seedUsers(
  companyId: string,
): Promise<Record<string, User & { canViewCompanyData: boolean }>> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_COST);
  const users: Record<string, User & { canViewCompanyData: boolean }> = {};

  for (const def of USER_DEFS) {
    const email = `${def.firstName}.${def.lastName}@testcompany1.example.com`.toLowerCase();
    const user = await insertUser(pool, {
      companyId,
      email,
      passwordHash,
      firstName: def.firstName,
      lastName: def.lastName,
      role: def.role,
    });
    if (def.canViewCompanyData) {
      await updateCanViewCompanyData(pool, companyId, user.id, true);
    }
    users[def.key] = { ...user, canViewCompanyData: def.canViewCompanyData };
  }

  return users;
}

async function seedTrips(
  companyId: string,
  users: Record<string, User>,
  now: Date,
): Promise<Record<string, Trip[]>> {
  const userKeys = USER_DEFS.map((def) => def.key);
  const tripsByUserKey: Record<string, Trip[]> = Object.fromEntries(
    userKeys.map((key) => [key, []]),
  );

  const months = monthsFromLastYearToNow(now);
  let templateCursor = 0;
  let userCursor = 0;
  let tripCount = 0;

  for (const { year, month } of months) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    const maxDay = isCurrentMonth ? now.getDate() : daysInMonth;
    const daySpacing = Math.max(1, Math.floor(daysInMonth / TRIPS_PER_MONTH));

    for (let i = 0; i < TRIPS_PER_MONTH; i++) {
      const template = TEMPLATES[templateCursor % TEMPLATES.length];
      templateCursor++;
      const userKey = userKeys[userCursor % userKeys.length];
      userCursor++;

      const day = Math.min(maxDay, 2 + i * daySpacing);
      const date = toIsoDate(year, month, day);

      const co2eKg = await calculateCo2eKg(
        pool,
        template.transportType,
        template.fuelType,
        template.distanceKm,
        template.passengerCount,
      );

      const trip = await insertTrip(pool, companyId, {
        userId: users[userKey].id,
        transportType: template.transportType,
        fuelType: template.fuelType,
        distanceKm: template.distanceKm,
        passengerCount: template.passengerCount,
        co2eKg,
        date,
      });

      tripsByUserKey[userKey].push(trip);
      tripCount++;
    }
  }

  console.log(
    `Seeded ${tripCount} trips across ${months.length} months (2025-01 through ${toIsoDate(now.getFullYear(), now.getMonth(), 1).slice(0, 7)}).`,
  );
  return tripsByUserKey;
}

interface CarFuelSpec {
  fuelType: FuelType;
  distanceKm: number;
  passengerCount: number;
}

// GET /api/analytics/by-fuel-type is CAR-only and scoped to the current
// calendar month (see CURRENT_MONTH_FILTER in analyticsRepository.ts). The
// month-by-month TEMPLATES cycle above doesn't guarantee a CAR trip lands in
// the current month, so seed one of each fuel type there explicitly.
const CURRENT_MONTH_CAR_FUEL_TRIPS: CarFuelSpec[] = [
  { fuelType: 'PETROL', distanceKm: 32, passengerCount: 1 },
  { fuelType: 'DIESEL', distanceKm: 145, passengerCount: 1 },
  { fuelType: 'HYBRID', distanceKm: 60, passengerCount: 2 },
  { fuelType: 'ELECTRIC', distanceKm: 90, passengerCount: 1 },
];

async function seedCurrentMonthCarFuelTrips(
  companyId: string,
  users: Record<string, User>,
  now: Date,
): Promise<void> {
  const userKeys = USER_DEFS.map((def) => def.key);
  const year = now.getFullYear();
  const month = now.getMonth();
  const maxDay = now.getDate();
  const daySpacing = Math.max(1, Math.floor(maxDay / CURRENT_MONTH_CAR_FUEL_TRIPS.length));

  for (let i = 0; i < CURRENT_MONTH_CAR_FUEL_TRIPS.length; i++) {
    const spec = CURRENT_MONTH_CAR_FUEL_TRIPS[i];
    const userKey = userKeys[i % userKeys.length];
    const day = Math.min(maxDay, 1 + i * daySpacing);
    const date = toIsoDate(year, month, day);

    const co2eKg = await calculateCo2eKg(
      pool,
      'CAR',
      spec.fuelType,
      spec.distanceKm,
      spec.passengerCount,
    );

    await insertTrip(pool, companyId, {
      userId: users[userKey].id,
      transportType: 'CAR',
      fuelType: spec.fuelType,
      distanceKm: spec.distanceKm,
      passengerCount: spec.passengerCount,
      co2eKg,
      date,
    });
  }

  console.log(
    `Seeded ${CURRENT_MONTH_CAR_FUEL_TRIPS.length} CAR trips (one per fuel type) for the current month.`,
  );
}

interface EditRequestScenario {
  proposerKey: string;
  ownerKey: string;
  tripIndex: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const EDIT_REQUEST_SCENARIOS: EditRequestScenario[] = [
  { proposerKey: 'erik', ownerKey: 'anna', tripIndex: 0, status: 'APPROVED' },
  { proposerKey: 'lina', ownerKey: 'johan', tripIndex: 0, status: 'APPROVED' },
  { proposerKey: 'erik', ownerKey: 'sara', tripIndex: 0, status: 'REJECTED' },
  { proposerKey: 'lina', ownerKey: 'anna', tripIndex: 1, status: 'REJECTED' },
  { proposerKey: 'erik', ownerKey: 'johan', tripIndex: 1, status: 'PENDING' },
  { proposerKey: 'lina', ownerKey: 'sara', tripIndex: 1, status: 'PENDING' },
];

async function seedEditRequests(
  companyId: string,
  users: Record<string, User & { canViewCompanyData: boolean }>,
  tripsByUserKey: Record<string, Trip[]>,
): Promise<void> {
  for (const scenario of EDIT_REQUEST_SCENARIOS) {
    const proposer = users[scenario.proposerKey];
    const targetTrip = tripsByUserKey[scenario.ownerKey][scenario.tripIndex];

    const proposedDistanceKm = Math.round(targetTrip.distanceKm * 1.15 * 100) / 100;
    const proposedPassengerCount = Math.min(5, targetTrip.passengerCount + 1);

    const editRequest = await proposeEdit(
      companyId,
      { userId: proposer.id, role: proposer.role, canViewCompanyData: proposer.canViewCompanyData },
      targetTrip.id,
      {
        transportType: targetTrip.transportType,
        fuelType: targetTrip.fuelType,
        distanceKm: proposedDistanceKm,
        passengerCount: proposedPassengerCount,
        date: targetTrip.date,
      },
    );

    if (scenario.status !== 'PENDING') {
      await resolveEditRequest(companyId, editRequest.id, scenario.status);
    }
  }

  console.log(
    `Seeded ${EDIT_REQUEST_SCENARIOS.length} trip edit requests (2 PENDING, 2 APPROVED, 2 REJECTED).`,
  );
}

async function main(): Promise<void> {
  const now = new Date();

  await pool.query('DELETE FROM companies WHERE name = $1', [COMPANY_NAME]);

  const companyId = await withTransaction(async (client) => {
    const company = await insertCompany(client, COMPANY_NAME);
    return company.id;
  });

  const users = await seedUsers(companyId);
  const tripsByUserKey = await seedTrips(companyId, users, now);
  await seedCurrentMonthCarFuelTrips(companyId, users, now);
  await seedEditRequests(companyId, users, tripsByUserKey);

  console.log(`\nDone. Log in as any user with password "${DEMO_PASSWORD}", e.g.:`);
  for (const def of USER_DEFS) {
    const email = `${def.firstName}.${def.lastName}@testcompany1.example.com`.toLowerCase();
    console.log(
      `  - ${email} (${def.role}${def.canViewCompanyData ? ', canViewCompanyData' : ''})`,
    );
  }
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    return pool.end().finally(() => process.exit(1));
  });
