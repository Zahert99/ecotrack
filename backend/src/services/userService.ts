import bcrypt from 'bcrypt';
import { DatabaseError } from 'pg';
import { BCRYPT_COST } from '../config/passwordConfig';
import { pool } from '../database/pool';
import { UNIQUE_VIOLATION } from '../database/pgErrorCodes';
import { HttpError } from '../middleware/errorHandler';
import {
  insertUser,
  listUsersForCompany,
  PublicUser,
  toPublicUser,
  updateCanViewCompanyData,
  UserRole,
} from '../repositories/userRepository';

interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export async function createUser(companyId: string, input: CreateUserInput): Promise<PublicUser> {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

  try {
    const user = await insertUser(pool, {
      companyId,
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
    });
    return toPublicUser(user);
  } catch (err) {
    if (err instanceof DatabaseError && err.code === UNIQUE_VIOLATION) {
      throw new HttpError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    }
    throw err;
  }
}

export async function listUsers(companyId: string): Promise<PublicUser[]> {
  const users = await listUsersForCompany(pool, companyId);
  return users.map(toPublicUser);
}

export async function updatePermissions(
  companyId: string,
  userId: string,
  canViewCompanyData: boolean,
): Promise<PublicUser> {
  const updated = await updateCanViewCompanyData(pool, companyId, userId, canViewCompanyData);
  if (!updated) {
    throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
  }
  return toPublicUser(updated);
}
