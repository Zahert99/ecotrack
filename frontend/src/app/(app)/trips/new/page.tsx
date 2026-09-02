"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTrip } from "@/services/tripsApi";
import { TripForm } from "../_components/TripForm";

export default function NewTripPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      router.push("/trips");
    },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-foreground">Log New Travel</h2>
      <div className="rounded-xl border border-border bg-background p-6">
        <TripForm
          submitLabel="Log Trip"
          onSubmit={async (input) => {
            await mutation.mutateAsync(input);
          }}
          onCancel={() => router.push("/trips")}
        />
      </div>
    </div>
  );
}
