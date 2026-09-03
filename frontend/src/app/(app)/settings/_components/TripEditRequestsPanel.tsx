"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPendingTripEditRequests,
  resolveTripEditRequest,
} from "@/services/tripEditRequestsApi";
import type { PublicUser, TripEditRequestWithTrip } from "@/types/api";
import { FUEL_LABELS, formatDate, resolveUserLabel, TRANSPORT_LABELS } from "./formatters";

function DiffField({
  label,
  current,
  proposed,
}: {
  label: string;
  current: string;
  proposed: string;
}) {
  const changed = current !== proposed;
  return (
    <div>
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm ${changed ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
        {changed ? `${current} → ${proposed}` : current}
      </span>
    </div>
  );
}

function RequestCard({
  request,
  users,
  onResolve,
  isResolving,
}: {
  request: TripEditRequestWithTrip;
  users: PublicUser[] | undefined;
  onResolve: (id: string, status: "APPROVED" | "REJECTED") => void;
  isResolving: boolean;
}) {
  const { trip } = request;

  return (
    <li className="py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          {resolveUserLabel(users, request.requestedBy)} proposed a change
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isResolving}
            onClick={() => onResolve(request.id, "REJECTED")}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive-muted disabled:opacity-60"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={isResolving}
            onClick={() => onResolve(request.id, "APPROVED")}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            Approve
          </button>
        </div>
      </div>

      {trip ? (
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted p-3 lg:grid-cols-4">
          <DiffField
            label="Transport"
            current={TRANSPORT_LABELS[trip.transportType]}
            proposed={TRANSPORT_LABELS[request.proposedTransportType]}
          />
          <DiffField
            label="Fuel"
            current={trip.fuelType ? FUEL_LABELS[trip.fuelType] : "—"}
            proposed={request.proposedFuelType ? FUEL_LABELS[request.proposedFuelType] : "—"}
          />
          <DiffField
            label="Distance (km)"
            current={trip.distanceKm.toLocaleString()}
            proposed={request.proposedDistanceKm.toLocaleString()}
          />
          <DiffField label="Date" current={formatDate(trip.date)} proposed={formatDate(request.proposedDate)} />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Current trip values are unavailable (the trip may have been removed).
        </p>
      )}
    </li>
  );
}

export function TripEditRequestsPanel({ users }: { users: PublicUser[] | undefined }) {
  const queryClient = useQueryClient();
  const requestsQuery = useQuery({
    queryKey: ["tripEditRequests", "pending"],
    queryFn: listPendingTripEditRequests,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) =>
      resolveTripEditRequest(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripEditRequests", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  const requests = requestsQuery.data;

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <h3 className="text-lg font-semibold text-foreground">Trip Edit Requests</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Proposed changes to teammates&apos; travel logs
      </p>

      {requestsQuery.isError ? (
        <p className="text-sm text-destructive">Couldn&apos;t load pending edit requests.</p>
      ) : !requests ? (
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
      ) : requests.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No pending edit requests.</p>
      ) : (
        <ul className="divide-y divide-border">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              users={users}
              onResolve={(id, status) => mutation.mutate({ id, status })}
              isResolving={mutation.isPending}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
