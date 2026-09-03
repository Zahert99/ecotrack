"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { listUsers } from "@/services/usersApi";
import { AccessRequestPanel } from "./_components/AccessRequestPanel";
import { PermissionRequestsPanel } from "./_components/PermissionRequestsPanel";
import { TeamSection } from "./_components/TeamSection";
import { TripEditRequestsPanel } from "./_components/TripEditRequestsPanel";

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
    enabled: isAdmin,
  });

  return (
    <div className="space-y-6 p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-foreground">Settings</h2>

      {isAdmin ? (
        <>
          <TeamSection users={usersQuery.data} />
          <PermissionRequestsPanel users={usersQuery.data} />
          <TripEditRequestsPanel users={usersQuery.data} />
        </>
      ) : (
        <AccessRequestPanel />
      )}
    </div>
  );
}
