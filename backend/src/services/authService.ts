import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DatabaseError } from 'pg';
import { getJwtSecret } from '../config/jwtConfig';
import { BCRYPT_COST } from '../config/passwordConfig';
import { pool } from '../database/pool';
import { UNIQUE_VIOLATION } from '../database/pgErrorCodes';
import { withTransaction } from '../database/withTransaction';
import { HttpError } from '../middleware/errorHandler';
import { insertCompany } from '../repositories/companyRepository';
import {
  findUserByEmail,
  insertUser,
  PublicUser,
  toPublicUser,
  User,
} from '../repositories/userRepository';

const TOKEN_TTL = '24h';

function issueToken(userId: string, companyId: string, role: string): string {
  return jwt.sign({ companyId, role }, getJwtSecret(), { subject: userId, expiresIn: TOKEN_TTL });
}

interface AuthResult {
  token: string;
  user: PublicUser;
}

export async function signup(params: {
  companyName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResult> {
  const existing = await findUserByEmail(pool, params.email);
  if (existing) {
    throw new HttpError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(params.password, BCRYPT_COST);

  let user: User;
  try {
    user = await withTransaction(async (client) => {
      const company = await insertCompany(client, params.companyName);
      return insertUser(client, {
        companyId: company.id,
        email: params.email,
        passwordHash,
        firstName: params.firstName,
        lastName: params.lastName,
        role: 'ADMIN',
      });
    });
  } catch (err) {
    if (err instanceof DatabaseError && err.code === UNIQUE_VIOLATION) {
      throw new HttpError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    }
    throw err;
  }

  return { token: issueToken(user.id, user.companyId, user.role), user: toPublicUser(user) };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await findUserByEmail(pool, email);
  if (!user) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  return { token: issueToken(user.id, user.companyId, user.role), user: toPublicUser(user) };
}
