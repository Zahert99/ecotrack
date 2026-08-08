import { DatabaseError } from 'pg';
import { pool } from '../database/pool';
import { UNIQUE_VIOLATION } from '../database/pgErrorCodes';
import { withTransaction } from '../database/withTransaction';
import { HttpError } from '../middleware/errorHandler';
import {
  findLatestPermissionRequestForUser,
  findPermissionRequestById,
  insertPermissionRequest,
  listPendingPermissionRequestsForCompany,
  PermissionRequest,
  resolvePermissionRequest,
} from '../repositories/permissionRequestRepository';
import { findUserById, updateCanViewCompanyData } from '../repositories/userRepository';

interface Requester {
  userId: string;
}

export async function createRequest(
  companyId: string,
  requester: Requester,
): Promise<PermissionRequest> {
  const user = await findUserById(pool, companyId, requester.userId);
  if (!user) {
    throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
  }
  if (user.canViewCompanyData) {
    throw new HttpError(409, 'ALREADY_HAS_PERMISSION', 'You already have company-wide access');
  }

  try {
    return await insertPermissionRequest(pool, { companyId, userId: requester.userId });
  } catch (err) {
    if (err instanceof DatabaseError && err.code === UNIQUE_VIOLATION) {
      throw new HttpError(409, 'REQUEST_ALREADY_PENDING', 'You already have a pending request');
    }
    throw err;
  }
}

export async function getMyStatus(
  companyId: string,
  requester: Requester,
): Promise<PermissionRequest | null> {
  return findLatestPermissionRequestForUser(pool, companyId, requester.userId);
}

export async function listPending(companyId: string): Promise<PermissionRequest[]> {
  return listPendingPermissionRequestsForCompany(pool, companyId);
}

export async function resolveRequest(
  companyId: string,
  requestId: string,
  status: 'APPROVED' | 'REJECTED',
): Promise<PermissionRequest> {
  return withTransaction(async (client) => {
    const existing = await findPermissionRequestById(client, companyId, requestId);
    if (!existing) {
      throw new HttpError(404, 'PERMISSION_REQUEST_NOT_FOUND', 'Permission request not found');
    }
    if (existing.status !== 'PENDING') {
      throw new HttpError(
        409,
        'PERMISSION_REQUEST_ALREADY_RESOLVED',
        'This request has already been resolved',
      );
    }

    const resolved = await resolvePermissionRequest(client, companyId, requestId, status);
    if (!resolved) {
      throw new HttpError(
        409,
        'PERMISSION_REQUEST_ALREADY_RESOLVED',
        'This request has already been resolved',
      );
    }

    if (status === 'APPROVED') {
      await updateCanViewCompanyData(client, companyId, existing.userId, true);
    }

    return resolved;
  });
}
