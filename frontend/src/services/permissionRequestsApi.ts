import { apiRequest } from "@/services/api";
import type { MyPermissionRequestStatus, PermissionRequest, PermissionRequestType } from "@/types/api";

export function createPermissionRequest(type: PermissionRequestType): Promise<PermissionRequest> {
  return apiRequest<PermissionRequest>("/api/permission-requests", {
    method: "POST",
    data: { type },
  });
}

export function getMyPermissionStatus(): Promise<MyPermissionRequestStatus> {
  return apiRequest<MyPermissionRequestStatus>("/api/permission-requests/my-status");
}
