# EcoTrack

A multi-tenant SaaS MVP that helps small and medium-sized businesses (SMEs)
track and visualize the carbon footprint of their employees' business
travel — car, bus, train, and flight trips, with CO2e calculated
automatically from standardized emission factors rather than self-reported
numbers.

## Who it's for

Built for SMEs that want visibility into their travel-related emissions
without adopting heavyweight enterprise sustainability software. Each
company's data is fully isolated (multi-tenant), and access is role-based:
employees log their own trips, while admins (or employees granted
visibility) get company-wide analytics.

**Primary objectives**

- Give every employee a fast way to log a business trip and see its CO2e
  impact immediately.
- Give admins trustworthy, auditable numbers — emissions are always
  computed server-side from a fixed emission-factor table, never taken
  from client input.
- Surface _actionable_ analytics, not just totals — which travel mode is
  least efficient, what a company's fuel mix looks like, whether emissions
  are trending up or down year over year — so a company can act on the
  data, not just report it.

## Features

- **Auth** — signup creates a company plus its first admin user; JWT-based
  login, bcrypt-hashed passwords.
- **Trip logging** — full CRUD for business trips (transport mode, fuel
  type, distance, passenger count, date); CO2e is always calculated
  server-side from a standardized emission-factor table.
- **Roles & permissions** — `ADMIN` / `USER` roles plus a company-data
  visibility permission; admins invite and remove teammates and grant or
  revoke that visibility.
- **Collaborative trip editing** — a user with company-data visibility can
  propose an edit to a teammate's trip instead of editing it directly; an
  admin reviews and approves or rejects the proposal.
- **Self-service access requests** — users can request company-data
  visibility or promotion to admin; admins approve or reject from a single
  review queue.
- **Analytics** — monthly CO2e summary with month-over-month deltas, a
  year-to-date emissions trend, a transport-mode breakdown, efficiency
  (CO2e per km and per passenger) by mode, a fuel-type breakdown, and a
  quarterly year-over-year comparison — every view scoped to what the
  caller is allowed to see.
- **Safe user removal** — removing a user never deletes their logged
  trips; their name is preserved for historical attribution so company-wide
  analytics stay accurate.

## Tech stack

- **Backend**: Node.js, TypeScript, Express, PostgreSQL (raw parameterized
  SQL, no ORM), JWT auth, Zod validation, node-pg-migrate.
- **Frontend**: Next.js (App Router), TypeScript, React, Tailwind CSS,
  TanStack Query, Chart.js.

## Quick Start

### Prerequisites

- Node.js >= 20.9
- PostgreSQL, running locally
- npm

### 1. Clone the repo

```bash
git clone git@github.com:Zahert99/ecotrack.git
cd ecotrack
```

### 2. Database setup

Create the database, then apply migrations from `backend/` — this also
seeds the standardized emission-factor table, so there's no separate seed
step:

```bash
createdb ecotrack

cd backend
npm install
cp .env.example .env      # set DATABASE_URL / JWT_SECRET
npm run migrate:up
```

### 3. Backend

```bash
cd backend
npm run dev                # http://localhost:3000
```

### 4. Frontend

In a new terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                # http://localhost:3001
```

Full endpoint-by-endpoint API reference (request/response shapes, role
matrix, error codes) lives in `backend/API_REFERENCE.md`.
