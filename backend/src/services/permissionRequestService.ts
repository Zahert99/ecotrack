import { DatabaseError } from 'pg';
import { pool } from '../database/pool';
import { UNIQUE_VIOLATION } from '../database/pgErrorCodes';
import { withTransaction } from '../database/withTransaction';
import { HttpError } from '../middleware/errorHandler';
import {
  findLatestPermissionRequestsForUser,
  findPermissionRequestById,
  insertPermissionRequest,
  listPendingPermissionRequestsForCompany,
  PermissionRequest,
  PermissionRequestType,
  resolvePermissionRequest,
} from '../repositories/permissionRequestRepository';
import {
  findUserById,
  updateCanViewCompanyData,
  updateUserRole,
} from '../repositories/userRepository';

interface Requester {
  userId: string;
}

export interface MyPermissionRequestStatus {
  viewCompanyData: PermissionRequest | null;
  adminRole: PermissionRequest | null;
}

export async function createRequest(
  companyId: string,
  requester: Requester,
  requestType: PermissionRequestType = 'VIEW_COMPANY_DATA',
): Promise<PermissionRequest> {
  const user = await findUserById(pool, companyId, requester.userId);
  if (!user) {
    throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
  }
  if (requestType === 'VIEW_COMPANY_DATA' && user.canViewCompanyData) {
    throw new HttpError(409, 'ALREADY_HAS_PERMISSION', 'You already have company-wide access');
  }
  if (requestType === 'ADMIN_ROLE' && user.role === 'ADMIN') {
    throw new HttpError(409, 'ALREADY_ADMIN', 'You are already an admin');
  }

  try {
    return await insertPermissionRequest(pool, {
      companyId,
      userId: requester.userId,
      requestType,
    });
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
): Promise<MyPermissionRequestStatus> {
  const requests = await findLatestPermissionRequestsForUser(pool, companyId, requester.userId);
  return {
    viewCompanyData:
      requests.find((request) => request.requestType === 'VIEW_COMPANY_DATA') ?? null,
    adminRole: requests.find((request) => request.requestType === 'ADMIN_ROLE') ?? null,
  };
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
      if (existing.requestType === 'VIEW_COMPANY_DATA') {
        await updateCanViewCompanyData(client, companyId, existing.userId, true);
      } else {
        await updateUserRole(client, companyId, existing.userId, 'ADMIN');
      }
    }

    return resolved;
  });
}
