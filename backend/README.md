# EcoTrack Backend

## 1. Overview

The EcoTrack backend is a multi-tenant REST API for tracking and analyzing business travel
carbon emissions. It's built as a thesis MVP, prioritizing simple, explicit, maintainable
code over heavy architecture.

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5
- **Database**: PostgreSQL, accessed via the native `pg` driver — **raw parameterized SQL
  only, no ORM** (no Prisma/TypeORM/Knex)
- **Migrations**: `node-pg-migrate` (plain `.sql` migration files in `migrations/`)
- **Validation**: Zod v4
- **Auth**: JWT (24h expiry) + bcrypt password hashing (cost 12)

The codebase follows Clean Architecture principles, kept intentionally simple:

```
Route → Controller → Service → Repository → Database
```

- Business logic never depends on Express or PostgreSQL directly.
- All database access lives in repositories, as raw parameterized SQL.
- HTTP concerns (status codes, request/response shapes) live in controllers.
- Business rules and orchestration live in services.

```
src/
 ├── config/         # jwtConfig, passwordConfig (bcrypt cost)
 ├── controllers/    # HTTP layer; Zod schemas are colocated/exported here
 ├── routes/
 ├── services/       # business logic, framework-agnostic
 ├── repositories/   # all DB access, raw parameterized SQL
 ├── middleware/      # auth (JWT verify + role checks), validate (Zod), errorHandler
 ├── database/        # pool.ts (pg Pool), withTransaction.ts
 ├── types/           # express.d.ts augments Request with req.auth
 ├── app.ts
 └── server.ts
```

There is intentionally no `models/` folder — data shapes live as TypeScript interfaces and
Zod schemas colocated in controllers/repositories.

Multi-tenancy is enforced via a `companyId` claim on the JWT — it's never read from the URL
or request body, so one tenant's data can never leak into another's response.

For the full endpoint-by-endpoint reference (request/response shapes, role matrix, error
codes), see **[API_REFERENCE.md](./API_REFERENCE.md)**.

## 2. Getting Started & Setup

### Environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

| Variable       | Description                                                              |
| -------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL` | Postgres connection string, e.g. `postgresql://localhost:5432/ecotrack` |
| `JWT_SECRET`   | Long random secret used to sign/verify auth tokens                       |
| `PORT`         | Port the API server listens on (defaults to `3000` in local dev)         |
| `CORS_ORIGIN`  | Origin allowed to call the API (the frontend dev server, `http://localhost:3001`) |

### Database

This project assumes you already have a PostgreSQL instance available (local install, a
remote dev database, etc.) — point `DATABASE_URL` at it. Make sure the database named in
the connection string exists (e.g. `createdb ecotrack`) before running migrations.

### Install & migrate

```bash
npm install
npm run migrate:up
```

`npm run migrate:up` applies every migration in `migrations/` in order, building the schema
(`companies`, `users`, `trips`, `emission_factors`, `permission_requests`,
`trip_edit_requests`) from scratch.

## 3. Seeding Test Data

Running migrations builds the schema **and** seeds the `emission_factors` reference table
with real Swedish emission factors (Naturvårdsverket / Trafikverket sourced), via the
`1788894988605_add-emission-factor-unit-and-swedish-values.sql` migration. It does not
create any companies, users, or trips — that's what the seed scripts below are for.

| Script                        | Command                       | What it does                                                                                   |
| ------------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `scripts/seedDemoData.ts`      | `npm run seed:demo`            | Populates `testCompany1` with 5 users and two years (2025 → today) of trip history covering every transport/fuel/passenger-count combination, plus current-month CAR trips across all fuel types and trip edit requests in all three states (`PENDING`/`APPROVED`/`REJECTED`) — enough real data to exercise every dashboard, trips list, and analytics view. |
| `scripts/seedTestCompany2.ts`  | `npm run seed:testcompany2`    | Populates a small, fully isolated `testCompany2` (2 users, 3 trips) with no relation to `testCompany1` — used to test cross-tenant access control (e.g. confirming a `testCompany1` user can never read/edit/delete a `testCompany2` trip). |

Both scripts are **idempotent** — each deletes any existing company of that name first
(cascading to its users/trips), then fully regenerates it, so you can re-run either one
anytime to reset that company's data.

```bash
npm run seed:demo
npm run seed:testcompany2
```

## 4. Pre-configured Demo Accounts & Credentials

**Default password for every seeded account: `DemoPass123!`**

### testCompany1

| Name           | Email                                       | Role  | canViewCompanyData |
| -------------- | -------------------------------------------- | ----- | ------------------- |
| Anna Andersson | anna.andersson@testcompany1.example.com      | ADMIN | –                    |
| Erik Svensson  | erik.svensson@testcompany1.example.com       | USER  | true                 |
| Lina Karlsson  | lina.karlsson@testcompany1.example.com       | USER  | true                 |
| Johan Nilsson  | johan.nilsson@testcompany1.example.com       | USER  | false                |
| Sara Lindqvist | sara.lindqvist@testcompany1.example.com      | USER  | false                |

### testCompany2

| Name               | Email                                          | Role  |
| ------------------ | ------------------------------------------------ | ----- |
| Admin Testcompany2 | admin.testcompany2@testcompany2.example.com      | ADMIN |
| Erik Jonsson       | erik.jonsson@testcompany2.example.com            | USER  |

## 5. Running the Backend

### Development

```bash
npm run dev
```

Runs the server with `tsx watch`, restarting automatically on file changes.

### Production

```bash
npm run build
npm run start
```

`build` compiles TypeScript to `dist/` via `tsc`; `start` runs the compiled output with
plain `node`.

### Other scripts

| Script               | Purpose                                      |
| -------------------- | --------------------------------------------- |
| `npm run typecheck`  | Run `tsc --noEmit` across the project          |
| `npm run format`     | Format all files with Prettier                |
| `npm run format:check` | Check formatting without writing changes    |
| `npm run migrate:down` | Roll back the most recent migration          |
| `npm run migrate:create` | Scaffold a new migration file             |
