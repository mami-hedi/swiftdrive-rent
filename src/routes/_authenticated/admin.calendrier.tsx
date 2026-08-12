import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchAllReservations, fetchVehicles } from "@/services/api";
import { STATUS_LABELS, eur, formatDate, formatDateTime } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/admin/calendrier")({
  component: AdminCalendar,
});

const DAYS = 30;

function AdminCalendar() {
  const { data: vehicles, isLoading } = useQuery({ queryKey: ["vehicles"], queryFn: fetchVehicles });
  const { data: reservations } = useQuery({ queryKey: ["all-reservations"], queryFn: fetchAllReservations });

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: DAYS }).map((_, i) => new Date(today.getTime() + i * 86_400_000));
  const active = (reservations ?? []).filter((r) => ["pending", "confirmed", "ongoing"].includes(r.status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Calendrier des réservations</h1>
        <p className="mt-2 text-sm text-muted-foreground">30 prochains jours · cliquez sur une réservation pour le détail.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[1100px] text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium">Véhicule</th>
              {days.map((d) => (
                <th key={d.toISOString()} className="px-1 py-3 font-medium text-muted-foreground">
                  {d.getDate()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(vehicles ?? []).map((v) => (
              <tr key={v.id} className="border-b border-border last:border-0">
                <td className="sticky left-0 z-10 whitespace-nowrap bg-card px-4 py-2 font-medium">
                  {v.brand} {v.model}
                </td>
                {days.map((d) => {
                  const res = active.find(
                    (r) => new Date(r.start_at) <= new Date(d.getTime() + 86_399_000) && new Date(r.end_at) >= d && r.vehicle_id === v.id,
                  );
                  if (!res) return <td key={d.toISOString()} className="p-1"><div className="h-6 rounded bg-muted/60" /></td>;
                  return (
                    <td key={d.toISOString()} className="p-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="h-6 w-full rounded bg-accent transition-opacity hover:opacity-80" aria-label="Réservation" />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{res.reference}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2 text-sm">
                            <p><strong>{res.first_name} {res.last_name}</strong> · {res.email}</p>
                            <p>{res.vehicles?.brand} {res.vehicles?.model}</p>
                            <p>{formatDateTime(res.start_at)} → {formatDateTime(res.end_at)}</p>
                            <p>{res.pickup_location} → {res.dropoff_location}</p>
                            <p className="text-base font-semibold">{eur(Number(res.total))}</p>
                            <Badge variant={res.status === "confirmed" ? "success" : "warning"}>{STATUS_LABELS[res.status]}</Badge>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Du {formatDate(days[0]!.toISOString())} au {formatDate(days[days.length - 1]!.toISOString())} · orange = réservé
      </p>
    </div>
  );
}
