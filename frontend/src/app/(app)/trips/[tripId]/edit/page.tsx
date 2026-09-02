"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getTrip, updateTrip } from "@/services/tripsApi";
import type { TripInput } from "@/types/api";
import { TripForm } from "../../_components/TripForm";

export default function EditTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tripQuery = useQuery({ queryKey: ["trips", tripId], queryFn: () => getTrip(tripId) });

  const canEdit =
    !!user && !!tripQuery.data && (tripQuery.data.userId === user.id || user.role === "ADMIN");

  useEffect(() => {
    if (tripQuery.data && !canEdit) {
      router.replace("/trips");
    }
  }, [tripQuery.data, canEdit, router]);

  const mutation = useMutation({
    mutationFn: (input: TripInput) => updateTrip(tripId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      router.push("/trips");
    },
  });

  if (tripQuery.isError) {
    return <p className="p-6 text-sm text-destructive md:p-8">Couldn&apos;t load this trip.</p>;
  }
  if (!tripQuery.data || !canEdit) {
    return <div className="m-6 h-48 animate-pulse rounded-xl border border-border bg-muted md:m-8" />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-foreground">Edit Trip</h2>
      <div className="rounded-xl border border-border bg-background p-6">
        <TripForm
          initialValues={tripQuery.data}
          submitLabel="Save Changes"
          onSubmit={async (input) => {
            await mutation.mutateAsync(input);
          }}
          onCancel={() => router.push("/trips")}
        />
      </div>
    </div>
  );
}
