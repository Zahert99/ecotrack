import { UserRole } from '../repositories/userRepository';

export interface ScopedRequester {
  userId: string;
  role: UserRole;
  canViewCompanyData: boolean;
}

export function resolveCompanyScope(requester: ScopedRequester): string | null {
  return requester.role === 'ADMIN' || requester.canViewCompanyData ? null : requester.userId;
}
