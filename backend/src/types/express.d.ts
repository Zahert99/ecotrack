import { UserRole } from '../repositories/userRepository';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        companyId: string;
        role: UserRole;
        canViewCompanyData: boolean;
      };
    }
  }
}

export {};
