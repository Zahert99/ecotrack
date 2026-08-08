import { Pool, PoolClient } from 'pg';

export type PermissionRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PermissionRequest {
  id: string;
  companyId: string;
  userId: string;
  status: PermissionRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface PermissionRequestRow {
  id: string;
  company_id: string;
  user_id: string;
  status: PermissionRequestStatus;
  created_at: Date;
  updated_at: Date;
}

const SELECT_COLUMNS = 'id, company_id, user_id, status, created_at, updated_at';

function toPermissionRequest(row: PermissionRequestRow): PermissionRequest {
  return {
    id: row.id,
    companyId: row.company_id,
    userId: row.user_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function insertPermissionRequest(
  client: Pool | PoolClient,
  params: { companyId: string; userId: string },
): Promise<PermissionRequest> {
  const result = await client.query<PermissionRequestRow>(
    `INSERT INTO permission_requests (company_id, user_id)
     VALUES ($1, $2)
     RETURNING ${SELECT_COLUMNS}`,
    [params.companyId, params.userId],
  );
  return toPermissionRequest(result.rows[0]);
}

export async function findLatestPermissionRequestForUser(
  client: Pool | PoolClient,
  companyId: string,
  userId: string,
): Promise<PermissionRequest | null> {
  const result = await client.query<PermissionRequestRow>(
    `SELECT ${SELECT_COLUMNS} FROM permission_requests
     WHERE company_id = $1 AND user_id = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [companyId, userId],
  );
  return result.rows[0] ? toPermissionRequest(result.rows[0]) : null;
}

export async function listPendingPermissionRequestsForCompany(
  client: Pool | PoolClient,
  companyId: string,
): Promise<PermissionRequest[]> {
  const result = await client.query<PermissionRequestRow>(
    `SELECT ${SELECT_COLUMNS} FROM permission_requests
     WHERE company_id = $1 AND status = 'PENDING'
     ORDER BY created_at ASC`,
    [companyId],
  );
  return result.rows.map(toPermissionRequest);
}

export async function findPermissionRequestById(
  client: Pool | PoolClient,
  companyId: string,
  id: string,
): Promise<PermissionRequest | null> {
  const result = await client.query<PermissionRequestRow>(
    `SELECT ${SELECT_COLUMNS} FROM permission_requests WHERE company_id = $1 AND id = $2`,
    [companyId, id],
  );
  return result.rows[0] ? toPermissionRequest(result.rows[0]) : null;
}

export async function resolvePermissionRequest(
  client: Pool | PoolClient,
  companyId: string,
  id: string,
  status: 'APPROVED' | 'REJECTED',
): Promise<PermissionRequest | null> {
  const result = await client.query<PermissionRequestRow>(
    `UPDATE permission_requests
     SET status = $3, updated_at = NOW()
     WHERE company_id = $1 AND id = $2 AND status = 'PENDING'
     RETURNING ${SELECT_COLUMNS}`,
    [companyId, id, status],
  );
  return result.rows[0] ? toPermissionRequest(result.rows[0]) : null;
}
