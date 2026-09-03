import { apiRequest } from "@/services/api";
import type { PublicUser, Role } from "@/types/api";

export interface InviteUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

export function listUsers(): Promise<PublicUser[]> {
  return apiRequest<PublicUser[]>("/api/users");
}

export function inviteUser(input: InviteUserInput): Promise<PublicUser> {
  return apiRequest<PublicUser>("/api/users", { method: "POST", data: input });
}

export function updateUserPermissions(
  userId: string,
  canViewCompanyData: boolean,
): Promise<PublicUser> {
  return apiRequest<PublicUser>(`/api/users/${userId}/permissions`, {
    method: "PATCH",
    data: { canViewCompanyData },
  });
}
