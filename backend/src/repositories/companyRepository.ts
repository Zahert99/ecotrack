import { Pool, PoolClient } from 'pg';

export interface Company {
  id: string;
  name: string;
  createdAt: Date;
}

interface CompanyRow {
  id: string;
  name: string;
  created_at: Date;
}

function toCompany(row: CompanyRow): Company {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export async function insertCompany(client: Pool | PoolClient, name: string): Promise<Company> {
  const result = await client.query<CompanyRow>(
    'INSERT INTO companies (name) VALUES ($1) RETURNING id, name, created_at',
    [name],
  );
  return toCompany(result.rows[0]);
}

export interface CompanySummary {
  name: string;
  employeeCount: number;
}

export async function getCompanySummary(
  client: Pool | PoolClient,
  companyId: string,
): Promise<CompanySummary | null> {
  const result = await client.query<{ name: string; employee_count: string }>(
    `SELECT c.name, (SELECT COUNT(*) FROM users u WHERE u.company_id = c.id) AS employee_count
     FROM companies c
     WHERE c.id = $1`,
    [companyId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return { name: row.name, employeeCount: Number(row.employee_count) };
}
