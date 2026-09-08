import type { PublicUser, Trip } from "@/types/api";
import { formatCo2e, formatDate, FUEL_LABELS, resolveTripOwnerLabel, TRANSPORT_LABELS } from "./formatters";
import { BusIcon, CarIcon, FlightIcon, TrainIcon } from "./icons";
import { TripRowActions } from "./TripRowActions";

const TRANSPORT_ICONS = { CAR: CarIcon, BUS: BusIcon, TRAIN: TrainIcon, FLIGHT: FlightIcon };

interface TripsMobileListProps {
  trips: Trip[];
  onDelete: (trip: Trip) => void;
  onProposeEdit: (trip: Trip) => void;
  deletingTripId: string | null;
  users?: PublicUser[];
}

export function TripsMobileList({
  trips,
  onDelete,
  onProposeEdit,
  deletingTripId,
  users,
}: TripsMobileListProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {trips.map((trip) => {
        const TransportIcon = TRANSPORT_ICONS[trip.transportType];
        const co2e = formatCo2e(trip.co2eKg);
        return (
          <div key={trip.id} className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <TransportIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">{formatDate(trip.date)}</span>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {TRANSPORT_LABELS[trip.transportType]}
                    </span>
                    {trip.fuelType && (
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {FUEL_LABELS[trip.fuelType]}
                      </span>
                    )}
                  </div>
                  {users && (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Logged by {resolveTripOwnerLabel(users, trip)}
                    </span>
                  )}
                </div>
              </div>
              <TripRowActions
                trip={trip}
                onDelete={onDelete}
                onProposeEdit={onProposeEdit}
                isDeleting={deletingTripId === trip.id}
              />
            </div>
            <div className="flex items-end justify-between border-t border-border pt-2">
              <div>
                <span className="block text-xs text-muted-foreground">Distance</span>
                <span className="text-sm font-medium text-foreground">
                  {trip.distanceKm.toLocaleString()} km
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">Passengers</span>
                <span className="text-sm font-medium text-foreground">
                  {trip.passengerCount.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-xs text-muted-foreground">Total Impact</span>
                <span className="text-lg font-bold text-primary">
                  {co2e.value}{" "}
                  <span className="text-xs font-normal text-muted-foreground">{co2e.unit} CO2e</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
