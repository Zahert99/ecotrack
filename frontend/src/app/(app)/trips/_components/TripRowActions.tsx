"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getMine } from "@/services/tripEditRequestsApi";
import type { Trip } from "@/types/api";
import { ManageMenu } from "./ManageMenu";

interface TripRowActionsProps {
  trip: Trip;
  onDelete: (trip: Trip) => void;
  onProposeEdit: (trip: Trip) => void;
  isDeleting?: boolean;
}

export function TripRowActions({ trip, onDelete, onProposeEdit, isDeleting }: TripRowActionsProps) {
  const { user } = useAuth();
  const canManage = !!user && (trip.userId === user.id || user.role === "ADMIN");
  const canPropose = !!user && !canManage && user.canViewCompanyData;

  const mineQuery = useQuery({
    queryKey: ["tripEditRequests", trip.id, "mine"],
    queryFn: () => getMine(trip.id),
    enabled: canPropose,
  });

  if (canManage) {
    return (
      <ManageMenu
        editHref={`/trips/${trip.id}/edit`}
        onDelete={() => onDelete(trip)}
        isDeleting={isDeleting}
      />
    );
  }

  if (canPropose) {
    if (mineQuery.data?.status === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          Pending review
        </span>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onProposeEdit(trip)}
        className="inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary hover:bg-secondary/20"
      >
        Propose Edit
      </button>
    );
  }

  return null;
}
