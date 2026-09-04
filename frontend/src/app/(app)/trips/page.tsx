"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/services/api";
import { deleteTrip, listTrips } from "@/services/tripsApi";
import { listUsers } from "@/services/usersApi";
import type { Trip } from "@/types/api";
import { FilterBar, type TripFilters } from "./_components/FilterBar";
import { ProposeEditModal } from "./_components/ProposeEditModal";
import { TripsMobileList } from "./_components/TripsMobileList";
import { TripsTable } from "./_components/TripsTable";

export default function TripsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tripsQuery = useQuery({ queryKey: ["trips"], queryFn: listTrips });
  const canSeeCompanyData = user?.role === "ADMIN" || !!user?.canViewCompanyData;
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
    enabled: canSeeCompanyData,
  });

  const [filters, setFilters] = useState<TripFilters>({ transportType: "ALL", from: "", to: "" });
  const [proposeEditTrip, setProposeEditTrip] = useState<Trip | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [tripPendingDelete, setTripPendingDelete] = useState<Trip | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteTrip,
    onMutate: (tripId: string) => setDeletingTripId(tripId),
    onSettled: () => setDeletingTripId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      setTripPendingDelete(null);
    },
  });

  const trips = tripsQuery.data;
  const filteredTrips = useMemo(() => {
    if (!trips) return [];
    return trips.filter((trip) => {
      if (filters.transportType !== "ALL" && trip.transportType !== filters.transportType) {
        return false;
      }
      if (filters.from && trip.date < filters.from) return false;
      if (filters.to && trip.date > filters.to) return false;
      return true;
    });
  }, [trips, filters]);

  function handleDelete(trip: Trip) {
    deleteMutation.reset();
    setTripPendingDelete(trip);
  }

  const deleteErrorMessage = deleteMutation.isError
    ? deleteMutation.error instanceof ApiError
      ? deleteMutation.error.message
      : "Something went wrong. Please try again."
    : null;

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Travel Logs</h2>
        <Link
          href="/trips/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Log New Travel
        </Link>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {tripsQuery.isError ? (
        <p className="text-sm text-destructive">Couldn&apos;t load your trips.</p>
      ) : !trips ? (
        <div className="h-48 animate-pulse rounded-xl border border-border bg-muted" />
      ) : filteredTrips.length === 0 ? (
        <div className="rounded-xl border border-border bg-background p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {trips.length === 0 ? "No trips logged yet." : "No trips match these filters."}
          </p>
        </div>
      ) : (
        <>
          <TripsTable
            trips={filteredTrips}
            onDelete={handleDelete}
            onProposeEdit={setProposeEditTrip}
            deletingTripId={deletingTripId}
            users={canSeeCompanyData ? usersQuery.data : undefined}
          />
          <TripsMobileList
            trips={filteredTrips}
            onDelete={handleDelete}
            onProposeEdit={setProposeEditTrip}
            deletingTripId={deletingTripId}
            users={canSeeCompanyData ? usersQuery.data : undefined}
          />
        </>
      )}

      {proposeEditTrip && (
        <ProposeEditModal trip={proposeEditTrip} onClose={() => setProposeEditTrip(null)} />
      )}

      {tripPendingDelete && (
        <ConfirmationModal
          title="Delete Travel Log"
          description={`Delete this ${tripPendingDelete.transportType.toLowerCase()} trip? This action cannot be undone.`}
          confirmLabel="Delete"
          tone="destructive"
          isConfirming={deleteMutation.isPending}
          error={deleteErrorMessage}
          onConfirm={() => deleteMutation.mutate(tripPendingDelete.id)}
          onCancel={() => setTripPendingDelete(null)}
        />
      )}
    </div>
  );
}
