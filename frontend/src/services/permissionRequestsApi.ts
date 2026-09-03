import { apiRequest } from "@/services/api";
import type {
  MyPermissionRequestStatus,
  PermissionRequest,
  PermissionRequestType,
} from "@/types/api";

export function createPermissionRequest(type: PermissionRequestType): Promise<PermissionRequest> {
  return apiRequest<PermissionRequest>("/api/permission-requests", {
    method: "POST",
    data: { type },
  });
}

export function getMyPermissionStatus(): Promise<MyPermissionRequestStatus> {
  return apiRequest<MyPermissionRequestStatus>("/api/permission-requests/my-status");
}

export function listPendingPermissionRequests(): Promise<PermissionRequest[]> {
  return apiRequest<PermissionRequest[]>("/api/permission-requests");
}

export function resolvePermissionRequest(
  id: string,
  status: "APPROVED" | "REJECTED",
): Promise<PermissionRequest> {
  return apiRequest<PermissionRequest>(`/api/permission-requests/${id}`, {
    method: "PATCH",
    data: { status },
  });
}
