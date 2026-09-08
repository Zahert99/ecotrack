/*
 * Seeds a small, isolated 'testCompany2' tenant for cross-tenant security
 * testing (see the Insomnia test guide) — a separate company/users/trips
 * with no relation to 'testCompany1', so a testCompany1 session's token can
 * be used to probe access to testCompany2's resources.
 *
 * Re-runnable: any existing 'testCompany2' company is deleted first (cascades
 * to its users/trips), then fully regenerated.
 *
 * Usage: npm run seed:testcompany2   (from backend/)
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { BCRYPT_COST } from '../src/config/passwordConfig';
import { pool } from '../src/database/pool';
import { withTransaction } from '../src/database/withTransaction';
import { insertCompany } from '../src/repositories/companyRepository';
import { FuelType, insertTrip, TransportType } from '../src/repositories/tripRepository';
import { insertUser, UserRole } from '../src/repositories/userRepository';
import { calculateCo2eKg } from '../src/services/emissionsService';

const COMPANY_NAME = 'testCompany2';
const DEMO_PASSWORD = 'DemoPass123!';

interface UserDef {
  firstName: string;
  lastName: string;
  role: UserRole;
}

const USER_DEFS: UserDef[] = [
  { firstName: 'Admin', lastName: 'Testcompany2', role: 'ADMIN' },
  { firstName: 'Erik', lastName: 'Jonsson', role: 'USER' },
];

interface TripTemplate {
  transportType: TransportType;
  fuelType: FuelType | null;
  distanceKm: number;
  passengerCount: number;
}

const TRIP_TEMPLATES: TripTemplate[] = [
  { transportType: 'CAR', fuelType: 'PETROL', distanceKm: 42, passengerCount: 1 },
  { transportType: 'TRAIN', fuelType: null, distanceKm: 180, passengerCount: 1 },
  { transportType: 'BUS', fuelType: null, distanceKm: 25, passengerCount: 2 },
];

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  const now = new Date();

  await pool.query('DELETE FROM companies WHERE name = $1', [COMPANY_NAME]);

  const companyId = await withTransaction(async (client) => {
    const company = await insertCompany(client, COMPANY_NAME);
    return company.id;
  });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_COST);
  const users = [];
  for (const def of USER_DEFS) {
    const email = `${def.firstName}.${def.lastName}@testcompany2.example.com`.toLowerCase();
    const user = await insertUser(pool, {
      companyId,
      email,
      passwordHash,
      firstName: def.firstName,
      lastName: def.lastName,
      role: def.role,
    });
    users.push(user);
  }

  const owner = users.find((u) => u.role === 'USER')!;
  const tripIds: string[] = [];

  for (let i = 0; i < TRIP_TEMPLATES.length; i++) {
    const template = TRIP_TEMPLATES[i];
    const day = Math.min(now.getDate(), i + 1);
    const date = toIsoDate(new Date(now.getFullYear(), now.getMonth(), day));

    const co2eKg = await calculateCo2eKg(
      pool,
      template.transportType,
      template.fuelType,
      template.distanceKm,
      template.passengerCount,
    );

    const trip = await insertTrip(pool, companyId, {
      userId: owner.id,
      transportType: template.transportType,
      fuelType: template.fuelType,
      distanceKm: template.distanceKm,
      passengerCount: template.passengerCount,
      co2eKg,
      date,
    });

    tripIds.push(trip.id);
  }

  console.log(`\nSeeded '${COMPANY_NAME}' (id: ${companyId})`);
  console.log(`\nUsers (password: "${DEMO_PASSWORD}"):`);
  for (const user of users) {
    console.log(`  - ${user.email} (${user.role})`);
  }
  console.log(`\nTrips (owned by ${owner.email}):`);
  for (const id of tripIds) {
    console.log(`  - ${id}`);
  }
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    return pool.end().finally(() => process.exit(1));
  });
