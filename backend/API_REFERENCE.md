# EcoTrack API Reference (Slices 0–4)

Base URL: `http://localhost:<PORT>` (see `backend/.env`). All request/response bodies are JSON.

## 1. Auth & Headers

Every route except `POST /api/auth/signup` and `POST /api/auth/login` requires:

```
Authorization: Bearer <token>
```

`token` is returned from signup/login and is valid for **24 hours**. There is no refresh endpoint — the frontend should treat a `401` as "redirect to login."

Two independent gates run per route, in order:

1. **`requireAuth`** — verifies the JWT and attaches `req.auth = { userId, companyId, role, canViewCompanyData }`. `canViewCompanyData` is re-fetched from the database on every request (not stored in the token), so a permission grant/revoke by an admin takes effect on the user's very next call — no re-login needed.
2. **`requireRole('ADMIN' | 'USER')`** — on routes that need it, 403s if `req.auth.role` doesn't match.

`companyId` is always taken from the token, never from the URL or body — you cannot pass `companyId` in a request to affect scoping.

### Role/permission matrix

| Route | Roles allowed | Notes |
|---|---|---|
| `POST /api/auth/signup` | none (public) | creates a new company + first user as `ADMIN` |
| `POST /api/auth/login` | none (public) | |
| `POST /api/trips` | ADMIN, USER | creates a trip owned by the caller |
| `GET /api/trips` | ADMIN, USER | USER sees own trips only, unless `canViewCompanyData` |
| `GET /api/trips/:tripId` | ADMIN, USER | USER can read a teammate's trip only if `canViewCompanyData` |
| `PUT /api/trips/:tripId` | ADMIN, or owner | `canViewCompanyData` does **not** grant edit rights on others' trips |
| `DELETE /api/trips/:tripId` | ADMIN, or owner | same as above |
| `GET /api/analytics/*` | ADMIN, USER | USER sees own data only, unless `canViewCompanyData` |
| `POST /api/users` | ADMIN | invite a teammate |
| `GET /api/users` | ADMIN | list company users |
| `PATCH /api/users/:id/permissions` | ADMIN | direct grant/revoke of `canViewCompanyData` |
| `POST /api/permission-requests` | USER | self-request `canViewCompanyData` |
| `GET /api/permission-requests/my-status` | USER | caller's latest request |
| `GET /api/permission-requests` | ADMIN | pending requests only |
| `PATCH /api/permission-requests/:id` | ADMIN | approve/reject |

---

## 2. Endpoints

### `/api/auth`

#### `POST /api/auth/signup`
```ts
// Request
{
  companyName: string;  // 1-255 chars
  email: string;        // valid email, max 255, lowercased server-side
  password: string;     // 8-72 chars
  firstName: string;    // 1-255 chars
  lastName: string;     // 1-255 chars
}
// 201 Response
{ data: { token: string; user: PublicUser } }
```
Errors: `409 EMAIL_TAKEN`

#### `POST /api/auth/login`
```ts
// Request
{ email: string; password: string }
// 200 Response
{ data: { token: string; user: PublicUser } }
```
Errors: `401 INVALID_CREDENTIALS`

---

### `/api/trips`

```ts
type TransportType = 'CAR' | 'BUS' | 'TRAIN' | 'FLIGHT';
type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';

interface Trip {
  id: string;
  userId: string;
  companyId: string;
  transportType: TransportType;
  fuelType: FuelType | null;
  distanceKm: number;
  passengerCount: number;
  co2eKg: number;       // server-calculated, ignore any client value
  date: string;          // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}
```

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
Same body shape as `POST`. `200` → `{ data: Trip }`. Errors: `404 TRIP_NOT_FOUND`, `403 FORBIDDEN`.

#### `DELETE /api/trips/:tripId`
`204` (no body). Errors: `404 TRIP_NOT_FOUND`, `403 FORBIDDEN`.

---

### `/api/analytics`

All three routes take no params/body and scope automatically to the caller (own data, or company-wide for ADMIN/`canViewCompanyData`).

```ts
interface MonthlySummary { totalCo2eKg: number; tripCount: number }
interface TransportBreakdown { transportType: TransportType; co2eKg: number; tripCount: number }
interface MonthlyTrend { month: string; co2eKg: number; tripCount: number }
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
{ canViewCompanyData: boolean }
// 200 Response
{ data: PublicUser }
```
Errors: `404 USER_NOT_FOUND` (also returned if `:id` belongs to another company — no cross-tenant leak)

---

### `/api/permission-requests`

```ts
interface PermissionRequest {
  id: string;
  companyId: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}
```

#### `POST /api/permission-requests` (USER)
No body. `201` → `{ data: PermissionRequest }`.
Errors: `409 ALREADY_HAS_PERMISSION`, `409 REQUEST_ALREADY_PENDING`

#### `GET /api/permission-requests/my-status` (USER)
`200` → `{ data: PermissionRequest | null }` — caller's most recent request, or `null` if they've never made one.

#### `GET /api/permission-requests` (ADMIN)
`200` → `{ data: PermissionRequest[] }` — **pending only**, oldest first (no status filter/history view yet).

#### `PATCH /api/permission-requests/:id` (ADMIN)
```ts
// Request
{ status: 'APPROVED' | 'REJECTED' }
// 200 Response
{ data: PermissionRequest }
```
On `APPROVED`, the target user's `canViewCompanyData` flips to `true` atomically with this update.
Errors: `404 PERMISSION_REQUEST_NOT_FOUND`, `409 PERMISSION_REQUEST_ALREADY_RESOLVED`

---

## 3. Error Format

Every error response has this shape:

```ts
{ error: { message: string; code: string; issues?: unknown[] } }
```

`issues` is only present on `400 VALIDATION_ERROR` (raw Zod issue array — useful for field-level form errors).

### Error codes by status

| Status | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | body/param failed schema validation |
| 400 | `CONSTRAINT_VIOLATION` | DB check constraint failed |
| 401 | `UNAUTHENTICATED` | missing/invalid/expired token, or account deleted mid-session |
| 401 | `INVALID_CREDENTIALS` | bad email/password on login |
| 403 | `FORBIDDEN` | wrong role, or not the trip owner |
| 404 | `TRIP_NOT_FOUND` / `USER_NOT_FOUND` / `PERMISSION_REQUEST_NOT_FOUND` | not found, or belongs to another company (identical response — no tenant leak) |
| 409 | `EMAIL_TAKEN` | signup or user-invite with a duplicate email |
| 409 | `ALREADY_HAS_PERMISSION` | requesting access while already granted |
| 409 | `REQUEST_ALREADY_PENDING` | duplicate pending permission request |
| 409 | `PERMISSION_REQUEST_ALREADY_RESOLVED` | resolving a request that's no longer `PENDING` |
| 500 | `INTERNAL_ERROR` | unhandled server error |

A `fetch` wrapper can safely branch on `error.code` for UI messaging and fall back to `error.message` for anything not in this table.
