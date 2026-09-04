# EcoTrack API Reference (Slices 0–4 + trip edit review / admin-role requests)

Base URL: `http://localhost:<PORT>` (see `backend/.env`). All request/response bodies are JSON.

## 1. Auth & Headers

Every route except `POST /api/auth/signup` and `POST /api/auth/login` requires:

```
Authorization: Bearer <token>
```

`token` is returned from signup/login and is valid for **24 hours**. There is no refresh endpoint — the frontend should treat a `401` as "redirect to login."

Two independent gates run per route, in order:

1. **`requireAuth`** — verifies the JWT and attaches `req.auth = { userId, companyId, role, canViewCompanyData }`. Both `role` and `canViewCompanyData` are re-fetched from the database on every request (neither is trusted from the token, even though the JWT still carries a `role` claim from login) — a permission grant, revoke, or role promotion by an admin takes effect on the user's very next call, no re-login needed.
2. **`requireRole('ADMIN' | 'USER')`** — on routes that need it, 403s if `req.auth.role` doesn't match.

`companyId` is always taken from the token, never from the URL or body — you cannot pass `companyId` in a request to affect scoping.

### Role/permission matrix

| Route                                       | Roles allowed   | Notes                                                                |
| ------------------------------------------- | --------------- | -------------------------------------------------------------------- |
| `POST /api/auth/signup`                     | none (public)   | creates a new company + first user as `ADMIN`                        |
| `POST /api/auth/login`                      | none (public)   |                                                                      |
| `POST /api/trips`                           | ADMIN, USER     | creates a trip owned by the caller                                   |
| `GET /api/trips`                            | ADMIN, USER     | USER sees own trips only, unless `canViewCompanyData`                |
| `GET /api/trips/:tripId`                    | ADMIN, USER     | USER can read a teammate's trip only if `canViewCompanyData`         |
| `PUT /api/trips/:tripId`                    | ADMIN, or owner | `canViewCompanyData` does **not** grant edit rights on others' trips |
| `DELETE /api/trips/:tripId`                 | ADMIN, or owner | same as above                                                        |
| `POST /api/trips/:tripId/edit-requests`     | USER            | propose an edit to a trip you can view but not directly edit         |
| `GET /api/trips/:tripId/edit-requests/mine` | ADMIN, USER     | your own latest proposal for that trip, or `null`                    |
| `GET /api/trip-edit-requests`               | ADMIN           | pending edit proposals company-wide                                  |
| `PATCH /api/trip-edit-requests/:id`         | ADMIN           | approve (applies the edit) / reject                                  |
| `GET /api/analytics/*`                      | ADMIN, USER     | USER sees own data only, unless `canViewCompanyData`                 |
| `POST /api/users`                           | ADMIN           | invite a teammate                                                    |
| `GET /api/users`                            | ADMIN           | list company users                                                   |
| `PATCH /api/users/:id/permissions`          | ADMIN           | direct grant/revoke of `canViewCompanyData`                          |
| `DELETE /api/users/:id`                     | ADMIN           | removes a user; their trips are preserved, not deleted               |
| `POST /api/permission-requests`             | USER            | self-request `canViewCompanyData` or `ADMIN_ROLE`                    |
| `GET /api/permission-requests/my-status`    | USER            | caller's latest request of each type                                 |
| `GET /api/permission-requests`              | ADMIN           | pending requests only (both types)                                   |
| `PATCH /api/permission-requests/:id`        | ADMIN           | approve/reject                                                       |

---

## 2. Endpoints

### `/api/auth`

#### `POST /api/auth/signup`

```ts
// Request
{
  companyName: string; // 1-255 chars
  email: string; // valid email, max 255, lowercased server-side
  password: string; // 8-72 chars
  firstName: string; // 1-255 chars
  lastName: string; // 1-255 chars
}
// 201 Response
{
  data: {
    token: string;
    user: PublicUser;
  }
}
```

Errors: `409 EMAIL_TAKEN`

#### `POST /api/auth/login`

```ts
// Request
{
  email: string;
  password: string;
}
// 200 Response
{
  data: {
    token: string;
    user: PublicUser;
  }
}
```

Errors: `401 INVALID_CREDENTIALS`

---

### `/api/trips`

```ts
type TransportType = 'CAR' | 'BUS' | 'TRAIN' | 'FLIGHT';
type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';

interface Trip {
  id: string;
  userId: string | null; // null if the owning user was since removed (DELETE /api/users/:id) — see deletedUserId/deletedUserName
  deletedUserId: string | null; // permanent snapshot of the removed user's id, NOT a live FK — that row no longer exists
  deletedUserName: string | null; // permanent snapshot of the removed user's name, for display once userId is null
  companyId: string;
  transportType: TransportType;
  fuelType: FuelType | null;
  distanceKm: number;
  passengerCount: number;
  co2eKg: number; // server-calculated, ignore any client value
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}
```

Removing a user (`DELETE /api/users/:id`) does **not** delete their trips —
`user_id` is nullable with `ON DELETE SET NULL`, and `deletedUserId`/
`deletedUserName` are snapshotted onto every affected trip in the same
transaction, before the user row is removed. This keeps company-wide
analytics (`GET /api/analytics/*`) historically accurate: those queries
already treat a `NULL` `user_id` as "still counts for company-wide scope,
never matches a specific user's own scope," so removed users' trips
continue contributing to aggregate totals exactly as before.

#### `POST /api/trips`

```ts
// Request
{
  transportType: TransportType;
  fuelType?: FuelType | null;   // required if transportType === 'CAR', forbidden otherwise
  distanceKm: number;           // > 0
  passengerCount?: number;      // int > 0, defaults to 1
  date: string;                 // YYYY-MM-DD, cannot be in the future
}
// 201 Response
{ data: Trip }
```

#### `GET /api/trips`

`200` → `{ data: Trip[] }` — own trips, or all company trips if ADMIN/`canViewCompanyData`.

#### `GET /api/trips/:tripId`

`200` → `{ data: Trip }`. Errors: `404 TRIP_NOT_FOUND`, `403 FORBIDDEN`.

#### `PUT /api/trips/:tripId`

Same body shape as `POST`. Applies **immediately** — only the trip's owner or an ADMIN may call this; a `canViewCompanyData` USER who isn't the owner gets `403 FORBIDDEN` here and must go through `POST /api/trips/:tripId/edit-requests` instead (see below). `200` → `{ data: Trip }`. Errors: `404 TRIP_NOT_FOUND`, `403 FORBIDDEN`.

#### `DELETE /api/trips/:tripId`

`204` (no body). Errors: `404 TRIP_NOT_FOUND`, `403 FORBIDDEN`.

---

### `/api/trips/:tripId/edit-requests` and `/api/trip-edit-requests`

A `canViewCompanyData` USER can _view_ a teammate's trip but can't `PUT` it directly. This lets them **propose** a change, which sits `PENDING` until an ADMIN approves (applies it, recalculating `co2eKg` server-side from the proposed values — never trusted from the request) or rejects it (trip is untouched). Owners and ADMINs don't use this — they just call `PUT` directly.

```ts
interface TripEditRequest {
  id: string;
  tripId: string;
  companyId: string;
  requestedBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  proposedTransportType: TransportType;
  proposedFuelType: FuelType | null;
  proposedDistanceKm: number;
  proposedPassengerCount: number;
  proposedDate: string;
  createdAt: string;
  updatedAt: string;
}

interface TripEditRequestWithTrip extends TripEditRequest {
  trip: Trip | null; // the trip's CURRENT values, for diffing against the proposed ones
}
```

#### `POST /api/trips/:tripId/edit-requests` (USER, `canViewCompanyData`, non-owner)

Same body shape as `POST /api/trips` / `PUT /api/trips/:tripId`. `201` → `{ data: TripEditRequest }`.
Errors: `404 TRIP_NOT_FOUND`, `403 FORBIDDEN` (owner, ADMIN, or lacking `canViewCompanyData` — use `PUT` instead), `409 EDIT_REQUEST_ALREADY_PENDING` (only one pending proposal per trip at a time)

#### `GET /api/trips/:tripId/edit-requests/mine`

`200` → `{ data: TripEditRequest | null }` — the caller's own latest proposal for that trip, or `null`. Read-access-gated the same way as `GET /api/trips/:tripId`.

#### `GET /api/trip-edit-requests` (ADMIN)

`200` → `{ data: TripEditRequestWithTrip[] }` — **pending only**, oldest first, each with the trip's current values alongside the proposed ones.

#### `PATCH /api/trip-edit-requests/:id` (ADMIN)

```ts
// Request
{
  status: 'APPROVED' | 'REJECTED';
}
// 200 Response
{
  data: TripEditRequest;
}
```

On `APPROVED`, the trip's fields (and recalculated `co2eKg`) update atomically with this call.
Errors: `404 EDIT_REQUEST_NOT_FOUND`, `409 EDIT_REQUEST_ALREADY_RESOLVED`

---

### `/api/analytics`

All three routes take no params/body and scope automatically to the caller (own data, or company-wide for ADMIN/`canViewCompanyData`).

```ts
interface MonthlySummary {
  totalCo2eKg: number;
  tripCount: number;
}
interface TransportBreakdown {
  transportType: TransportType;
  co2eKg: number;
  tripCount: number;
}
interface MonthlyTrend {
  month: string;
  co2eKg: number;
  tripCount: number;
}
```

- `GET /api/analytics/summary` → `200 { data: MonthlySummary }`
- `GET /api/analytics/by-transport` → `200 { data: TransportBreakdown[] }`
- `GET /api/analytics/trends` → `200 { data: MonthlyTrend[] }`

---

### `/api/users` (all routes ADMIN-only)

```ts
interface PublicUser {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
  canViewCompanyData: boolean;
  // no passwordHash — never returned by any endpoint
}
```

#### `POST /api/users`

```ts
// Request
{
  email: string;
  password: string;      // 8-72 chars
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'USER'; // defaults to 'USER'
}
// 201 Response
{ data: PublicUser }
```

Errors: `409 EMAIL_TAKEN`

#### `GET /api/users`

`200` → `{ data: PublicUser[] }`, ordered by creation date.

#### `PATCH /api/users/:id/permissions`

```ts
// Request
{
  canViewCompanyData: boolean;
}
// 200 Response
{
  data: PublicUser;
}
```

Errors: `404 USER_NOT_FOUND` (also returned if `:id` belongs to another company — no cross-tenant leak)

#### `DELETE /api/users/:id`

`204` (no body) on success. The user's trips are **not** deleted — see the
`Trip` interface above.

Errors: `400 CANNOT_DELETE_SELF`, `404 USER_NOT_FOUND` (also returned for a
cross-tenant `:id`), `409 LAST_ADMIN` (`:id` is the company's only remaining
`ADMIN`)

---

### `/api/permission-requests`

Covers two independent self-service request types — requesting `canViewCompanyData`, and requesting promotion to `ADMIN` — sharing one workflow. A user can hold at most one `PENDING` request _per type_ at once (a pending `VIEW_COMPANY_DATA` request doesn't block also requesting `ADMIN_ROLE`, and vice versa).

```ts
type PermissionRequestType = 'VIEW_COMPANY_DATA' | 'ADMIN_ROLE';

interface PermissionRequest {
  id: string;
  companyId: string;
  userId: string;
  requestType: PermissionRequestType;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}
```

#### `POST /api/permission-requests` (USER)

```ts
// Request
{
  type?: PermissionRequestType; // defaults to 'VIEW_COMPANY_DATA'
}
// 201 Response
{ data: PermissionRequest }
```

Errors: `409 ALREADY_HAS_PERMISSION` (type `VIEW_COMPANY_DATA`, already granted), `409 ALREADY_ADMIN` (type `ADMIN_ROLE`, already an ADMIN), `409 REQUEST_ALREADY_PENDING` (duplicate pending request of that same type)

#### `GET /api/permission-requests/my-status` (USER)

```ts
// 200 Response
{
  data: {
    viewCompanyData: PermissionRequest | null;
    adminRole: PermissionRequest | null;
  }
}
```

Each field is the caller's most recent request of that type, or `null` if they've never made one. **Breaking change**: this endpoint previously returned a single `PermissionRequest | null` under `data` — now that a user can have a pending request of each type simultaneously, `data` is this `{ viewCompanyData, adminRole }` map instead.

#### `GET /api/permission-requests` (ADMIN)

`200` → `{ data: PermissionRequest[] }` — **pending only** (both types mixed together, distinguish via `requestType`), oldest first (no status filter/history view yet).

#### `PATCH /api/permission-requests/:id` (ADMIN)

```ts
// Request
{
  status: 'APPROVED' | 'REJECTED';
}
// 200 Response
{
  data: PermissionRequest;
}
```

On `APPROVED`, the target user's `canViewCompanyData` flips to `true` (type `VIEW_COMPANY_DATA`) or `role` flips to `'ADMIN'` (type `ADMIN_ROLE`) atomically with this update — either way, in effect on the target user's very next authenticated request, no re-login needed (see §1).
Errors: `404 PERMISSION_REQUEST_NOT_FOUND`, `409 PERMISSION_REQUEST_ALREADY_RESOLVED`

---

## 3. Error Format

Every error response has this shape:

```ts
{ error: { message: string; code: string; issues?: unknown[] } }
```

`issues` is only present on `400 VALIDATION_ERROR` (raw Zod issue array — useful for field-level form errors).

### Error codes by status

| Status | Code                                                                                            | Meaning                                                                        |
| ------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 400    | `VALIDATION_ERROR`                                                                              | body/param failed schema validation                                            |
| 400    | `CONSTRAINT_VIOLATION`                                                                          | DB check constraint failed                                                     |
| 401    | `UNAUTHENTICATED`                                                                               | missing/invalid/expired token, or account deleted mid-session                  |
| 401    | `INVALID_CREDENTIALS`                                                                           | bad email/password on login                                                    |
| 403    | `FORBIDDEN`                                                                                     | wrong role, not the trip owner, or not eligible to propose an edit             |
| 404    | `TRIP_NOT_FOUND` / `USER_NOT_FOUND` / `PERMISSION_REQUEST_NOT_FOUND` / `EDIT_REQUEST_NOT_FOUND` | not found, or belongs to another company (identical response — no tenant leak) |
| 409    | `EMAIL_TAKEN`                                                                                   | signup or user-invite with a duplicate email                                   |
| 409    | `ALREADY_HAS_PERMISSION`                                                                        | requesting `VIEW_COMPANY_DATA` while already granted                           |
| 409    | `ALREADY_ADMIN`                                                                                 | requesting `ADMIN_ROLE` while already an ADMIN                                 |
| 409    | `REQUEST_ALREADY_PENDING`                                                                       | duplicate pending permission request of that type                              |
| 409    | `PERMISSION_REQUEST_ALREADY_RESOLVED`                                                           | resolving a permission request that's no longer `PENDING`                      |
| 409    | `EDIT_REQUEST_ALREADY_PENDING`                                                                  | trip already has a pending edit proposal                                       |
| 409    | `EDIT_REQUEST_ALREADY_RESOLVED`                                                                 | resolving an edit request that's no longer `PENDING`                           |
| 500    | `INTERNAL_ERROR`                                                                                | unhandled server error                                                         |

A `fetch` wrapper can safely branch on `error.code` for UI messaging and fall back to `error.message` for anything not in this table.
