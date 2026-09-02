"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { proposeEdit } from "@/services/tripEditRequestsApi";
import type { Trip, TripInput } from "@/types/api";
import { CloseIcon } from "./icons";
import { TripForm } from "./TripForm";

interface ProposeEditModalProps {
  trip: Trip;
  onClose: () => void;
}

export function ProposeEditModal({ trip, onClose }: ProposeEditModalProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (input: TripInput) => proposeEdit(trip.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripEditRequests", trip.id, "mine"] });
      onClose();
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-lg font-semibold text-foreground">Propose Trip Edit</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <TripForm
            initialValues={trip}
            submitLabel="Submit for Review"
            helperText="An admin will review this change before it applies."
            onSubmit={async (input) => {
              await mutation.mutateAsync(input);
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
