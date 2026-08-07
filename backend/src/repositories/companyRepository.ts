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
