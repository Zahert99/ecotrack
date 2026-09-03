"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPendingPermissionRequests,
  resolvePermissionRequest,
} from "@/services/permissionRequestsApi";
import type { PublicUser } from "@/types/api";
import { resolveUserLabel } from "./formatters";

const REQUEST_TYPE_LABELS = {
  VIEW_COMPANY_DATA: "Company-wide visibility",
  ADMIN_ROLE: "Admin role",
};

export function PermissionRequestsPanel({ users }: { users: PublicUser[] | undefined }) {
  const queryClient = useQueryClient();
  const requestsQuery = useQuery({
    queryKey: ["permissionRequests", "pending"],
    queryFn: listPendingPermissionRequests,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) =>
      resolvePermissionRequest(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissionRequests", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const requests = requestsQuery.data;

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <h3 className="text-lg font-semibold text-foreground">Permission Requests</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Self-service requests for company-wide visibility or admin role
      </p>

      {requestsQuery.isError ? (
        <p className="text-sm text-destructive">Couldn&apos;t load pending requests.</p>
      ) : !requests ? (
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
      ) : requests.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No pending requests.</p>
      ) : (
        <ul className="divide-y divide-border">
          {requests.map((request) => (
            <li key={request.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {resolveUserLabel(users, request.userId)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {REQUEST_TYPE_LABELS[request.requestType]}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: request.id, status: "REJECTED" })}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive-muted disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: request.id, status: "APPROVED" })}
                  className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  Approve
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
