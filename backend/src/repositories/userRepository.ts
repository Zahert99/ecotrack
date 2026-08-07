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
  createdAt: Date;
}

interface UserRow {
  id: string;
  company_id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  created_at: Date;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    companyId: row.company_id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    createdAt: row.created_at,
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
     RETURNING id, company_id, email, password_hash, first_name, last_name, role, created_at`,
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
    `SELECT id, company_id, email, password_hash, first_name, last_name, role, created_at
     FROM users WHERE email = $1`,
    [email],
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}
