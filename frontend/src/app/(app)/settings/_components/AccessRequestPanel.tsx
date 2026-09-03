"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { createPermissionRequest, getMyPermissionStatus } from "@/services/permissionRequestsApi";
import type { PermissionRequestType } from "@/types/api";

function StatusOrButton({
  isPending,
  isSubmitting,
  onRequest,
}: {
  isPending: boolean;
  isSubmitting: boolean;
  onRequest: () => void;
}) {
  if (isPending) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        Pending approval
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onRequest}
      disabled={isSubmitting}
      className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-secondary/90 disabled:opacity-60"
    >
      Request
    </button>
  );
}

export function AccessRequestPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["permissionRequests", "my-status"],
    queryFn: getMyPermissionStatus,
    enabled: user?.role === "USER",
  });

  const mutation = useMutation({
    mutationFn: (type: PermissionRequestType) => createPermissionRequest(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissionRequests", "my-status"] });
    },
  });

  if (!user || user.role !== "USER") {
    return null;
  }

  const viewPending = statusQuery.data?.viewCompanyData?.status === "PENDING";
  const adminPending = statusQuery.data?.adminRole?.status === "PENDING";

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <h3 className="mb-3 text-sm font-bold text-foreground">Request Access</h3>
      <div className="space-y-3">
        {!user.canViewCompanyData && (
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-sm font-bold text-foreground">Company-wide visibility</p>
              <p className="text-xs text-muted-foreground">
                View travel logs across the whole company
              </p>
            </div>
            <StatusOrButton
              isPending={viewPending}
              isSubmitting={mutation.isPending && mutation.variables === "VIEW_COMPANY_DATA"}
              onRequest={() => mutation.mutate("VIEW_COMPANY_DATA")}
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">Admin role</p>
            <p className="text-xs text-muted-foreground">Manage users and approve requests</p>
          </div>
          <StatusOrButton
            isPending={adminPending}
            isSubmitting={mutation.isPending && mutation.variables === "ADMIN_ROLE"}
            onRequest={() => mutation.mutate("ADMIN_ROLE")}
          />
        </div>
      </div>
    </div>
  );
}
