import type { Trip } from "@/types/api";
import { formatCo2e, formatDate, FUEL_LABELS, TRANSPORT_LABELS } from "./formatters";
import { BusIcon, CarIcon, FlightIcon, TrainIcon } from "./icons";
import { TripRowActions } from "./TripRowActions";

const TRANSPORT_ICONS = { CAR: CarIcon, BUS: BusIcon, TRAIN: TrainIcon, FLIGHT: FlightIcon };

interface TripsTableProps {
  trips: Trip[];
  onDelete: (trip: Trip) => void;
  onProposeEdit: (trip: Trip) => void;
  deletingTripId: string | null;
}

export function TripsTable({ trips, onDelete, onProposeEdit, deletingTripId }: TripsTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-border bg-background md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Transport
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fuel Type
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Distance (km)
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                CO2e
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trips.map((trip) => {
              const TransportIcon = TRANSPORT_ICONS[trip.transportType];
              const co2e = formatCo2e(trip.co2eKg);
              return (
                <tr key={trip.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm text-foreground">{formatDate(trip.date)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                      <TransportIcon className="h-3.5 w-3.5" />
                      {TRANSPORT_LABELS[trip.transportType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {trip.fuelType ? FUEL_LABELS[trip.fuelType] : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {trip.distanceKm.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">
                    {co2e.value} {co2e.unit}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <TripRowActions
                      trip={trip}
                      onDelete={onDelete}
                      onProposeEdit={onProposeEdit}
                      isDeleting={deletingTripId === trip.id}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
