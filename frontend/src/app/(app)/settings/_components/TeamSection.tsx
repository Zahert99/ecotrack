"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserPermissions } from "@/services/usersApi";
import type { PublicUser } from "@/types/api";
import { InviteUserModal } from "./InviteUserModal";

function RoleBadge({ role }: { role: PublicUser["role"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        role === "ADMIN"
          ? "bg-accent text-accent-foreground"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {role === "ADMIN" ? "Admin" : "User"}
    </span>
  );
}

function PermissionAction({ user }: { user: PublicUser }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (canViewCompanyData: boolean) => updateUserPermissions(user.id, canViewCompanyData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  if (user.role === "ADMIN") {
    return <span className="text-xs text-muted-foreground">Company data: Always</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">
        Company data: {user.canViewCompanyData ? "Yes" : "No"}
      </span>
      <button
        type="button"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate(!user.canViewCompanyData)}
        className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-60"
      >
        {user.canViewCompanyData ? "Revoke access" : "Grant access"}
      </button>
    </div>
  );
}

export function TeamSection({ users }: { users: PublicUser[] | undefined }) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Team & Users</h3>
          <p className="text-sm text-muted-foreground">Manage teammates and company-wide access</p>
        </div>
        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Invite User
        </button>
      </div>

      {!users ? (
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Name
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Role
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Company Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <PermissionAction user={user} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:hidden">
            {users.map((user) => (
              <div key={user.id} className="rounded-xl border border-border p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground wrap-break-word">{user.email}</p>
                  </div>
                  <div className="shrink-0">
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                <PermissionAction user={user} />
              </div>
            ))}
          </div>
        </>
      )}

      {isInviteOpen && <InviteUserModal onClose={() => setIsInviteOpen(false)} />}
    </div>
  );
}
