import { Pool, PoolClient } from 'pg';

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  companyId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  canViewCompanyData: boolean;
  createdAt: Date;
}

export interface PublicUser {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  canViewCompanyData: boolean;
}

interface UserRow {
  id: string;
  company_id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  can_view_company_data: boolean;
  created_at: Date;
}

const SELECT_COLUMNS = `id, company_id, email, password_hash, first_name, last_name, role,
  can_view_company_data, created_at`;

function toUser(row: UserRow): User {
  return {
    id: row.id,
    companyId: row.company_id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    canViewCompanyData: row.can_view_company_data,
    createdAt: row.created_at,
  };
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    companyId: user.companyId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    canViewCompanyData: user.canViewCompanyData,
  };
}

export async function insertUser(
  client: Pool | PoolClient,
  params: {
    companyId: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  },
): Promise<User> {
  const result = await client.query<UserRow>(
    `INSERT INTO users (company_id, email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${SELECT_COLUMNS}`,
    [
      params.companyId,
      params.email,
      params.passwordHash,
      params.firstName,
      params.lastName,
      params.role,
    ],
  );
  return toUser(result.rows[0]);
}

export async function findUserByEmail(
  client: Pool | PoolClient,
  email: string,
): Promise<User | null> {
  const result = await client.query<UserRow>(
    `SELECT ${SELECT_COLUMNS} FROM users WHERE email = $1`,
    [email],
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function findUserById(
  client: Pool | PoolClient,
  companyId: string,
  userId: string,
): Promise<User | null> {
  const result = await client.query<UserRow>(
    `SELECT ${SELECT_COLUMNS} FROM users WHERE company_id = $1 AND id = $2`,
    [companyId, userId],
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function listUsersForCompany(
  client: Pool | PoolClient,
  companyId: string,
): Promise<User[]> {
  const result = await client.query<UserRow>(
    `SELECT ${SELECT_COLUMNS} FROM users WHERE company_id = $1 ORDER BY created_at ASC`,
    [companyId],
  );
  return result.rows.map(toUser);
}

export async function updateCanViewCompanyData(
  client: Pool | PoolClient,
  companyId: string,
  userId: string,
  canViewCompanyData: boolean,
): Promise<User | null> {
  const result = await client.query<UserRow>(
    `UPDATE users
     SET can_view_company_data = $3
     WHERE company_id = $1 AND id = $2
     RETURNING ${SELECT_COLUMNS}`,
    [companyId, userId, canViewCompanyData],
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function findAuthProfileById(
  client: Pool | PoolClient,
  userId: string,
): Promise<{ role: UserRole; canViewCompanyData: boolean } | null> {
  const result = await client.query<{ role: UserRole; can_view_company_data: boolean }>(
    'SELECT role, can_view_company_data FROM users WHERE id = $1',
    [userId],
  );
  if (!result.rows[0]) {
    return null;
  }
  return { role: result.rows[0].role, canViewCompanyData: result.rows[0].can_view_company_data };
}

export async function updateUserRole(
  client: Pool | PoolClient,
  companyId: string,
  userId: string,
  role: UserRole,
): Promise<User | null> {
  const result = await client.query<UserRow>(
    `UPDATE users
     SET role = $3
     WHERE company_id = $1 AND id = $2
     RETURNING ${SELECT_COLUMNS}`,
    [companyId, userId, role],
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}
