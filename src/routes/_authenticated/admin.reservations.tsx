import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllReservations } from "@/services/api";
import { useRealtimeReservations } from "@/hooks/useRealtimeReservations";
import { STATUS_LABELS, eur, formatDate, formatDateTime, type Reservation, type ReservationStatus } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/admin/reservations")({
  component: AdminReservations,
});

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "today", label: "Aujourd'hui" },
  { key: "week", label: "Cette semaine" },
  { key: "month", label: "Ce mois" },
  { key: "pending", label: "En attente" },
  { key: "confirmed", label: "Confirmées" },
  { key: "cancelled", label: "Annulées" },
  { key: "completed", label: "Terminées" },
] as const;

const PAGE_SIZE = 10;

function AdminReservations() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["all-reservations"], queryFn: fetchAllReservations });
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useRealtimeReservations();

  const update = useMutation({
    mutationFn: async ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: ReservationStatus;
      reason?: string;
    }) => {
      const patch: Record<string, unknown> = { status };
      if (status === "cancelled") patch['cancellation_reason'] = reason?.trim() || "Annulée par l'équipe Velora";
      const { error } = await supabase.from("reservations").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast.success(
        vars.status === "confirmed"
          ? "Réservation confirmée. Le client voit le nouveau statut immédiatement."
          : vars.status === "cancelled"
            ? "Réservation annulée. Les dates sont de nouveau disponibles."
            : "Réservation mise à jour.",
      );
      queryClient.invalidateQueries({ queryKey: ["all-reservations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });


  const now = new Date();
  const rows = (data ?? []).filter((r) => {
    const start = new Date(r.start_at);
    if (filter === "today") return start.toDateString() === now.toDateString();
    if (filter === "week") return start >= now && start <= new Date(now.getTime() + 7 * 86_400_000);
    if (filter === "month") return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
    if (["pending", "confirmed", "cancelled", "completed"].includes(filter)) return r.status === filter;
    return true;
  }).filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.reference.toLowerCase().includes(q) ||
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) ||
      `${r.vehicles?.brand} ${r.vehicles?.model}`.toLowerCase().includes(q)
    );
  });

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Réservations</h1>
        <p className="mt-2 text-sm text-muted-foreground">{rows.length} réservation(s)</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "accent" : "outline"}
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Input
        placeholder="Rechercher par référence, client ou véhicule…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-md"
      />

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {["Référence", "Client", "Véhicule", "Départ", "Retour", "Durée", "Montant", "Statut", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{r.reference}</td>
                <td className="px-4 py-3">
                  {r.first_name} {r.last_name}
                  <span className="block text-xs text-muted-foreground">{r.email}</span>
                </td>
                <td className="px-4 py-3">{r.vehicles?.brand} {r.vehicles?.model}</td>
                <td className="px-4 py-3">{formatDate(r.start_at)}</td>
                <td className="px-4 py-3">{formatDate(r.end_at)}</td>
                <td className="px-4 py-3">{r.days} j</td>
                <td className="px-4 py-3 font-semibold">{eur(Number(r.total))}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.status === "confirmed" ? "success" : r.status === "cancelled" ? "destructive" : "warning"}>
                    {STATUS_LABELS[r.status]}
                  </Badge>
                  {r.status === "confirmed" && r.confirmed_at && (
                    <span className="mt-1 block text-[11px] text-muted-foreground">le {formatDateTime(r.confirmed_at)}</span>
                  )}
                  {r.status === "cancelled" && (
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {r.cancelled_at ? `le ${formatDateTime(r.cancelled_at)}` : null}
                      {r.cancellation_reason ? ` · ${r.cancellation_reason}` : null}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.status === "pending" && (
                      <ConfirmAction
                        label="Confirmer"
                        variant="accent"
                        title={`Confirmer la réservation ${r.reference} ?`}
                        description={`${r.first_name} ${r.last_name} · ${formatDate(r.start_at)} → ${formatDate(r.end_at)}. Le statut sera visible immédiatement dans l'espace client.`}
                        actionLabel="Confirmer la réservation"
                        disabled={update.isPending}
                        onConfirm={() => update.mutate({ id: r.id, status: "confirmed" })}
                      />
                    )}
                    {r.status === "confirmed" && (
                      <Button size="sm" variant="outline" disabled={update.isPending} onClick={() => update.mutate({ id: r.id, status: "ongoing" })}>
                        Démarrer
                      </Button>
                    )}
                    {r.status === "ongoing" && (
                      <Button size="sm" variant="outline" disabled={update.isPending} onClick={() => update.mutate({ id: r.id, status: "completed" })}>
                        Terminer
                      </Button>
                    )}
                    {r.status !== "cancelled" && r.status !== "completed" && (
                      <CancelAction
                        reservation={r}
                        disabled={update.isPending}
                        onConfirm={(reason) => update.mutate({ id: r.id, status: "cancelled", reason })}
                      />
                    )}
                  </div>
                </td>

              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                  Aucune réservation pour ce filtre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Page {page} / {pages}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
          <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
        </div>
      </div>
    </div>
  );
}

function ConfirmAction({
  label,
  title,
  description,
  actionLabel,
  variant = "accent",
  disabled,
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  actionLabel: string;
  variant?: "accent" | "outline" | "ghost";
  disabled?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant={variant} disabled={disabled}>{label}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Retour</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{actionLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CancelAction({
  reservation,
  disabled,
  onConfirm,
}: {
  reservation: Reservation;
  disabled?: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" disabled={disabled}>Annuler</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Annuler la réservation {reservation.reference} ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le véhicule redeviendra disponible sur ces dates et le client verra l'annulation ainsi que son motif dans son
            espace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase text-muted-foreground">Motif communiqué au client</Label>
          <Textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Véhicule indisponible, demande du client, dossier incomplet…"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Retour</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(reason)}>Confirmer l'annulation</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
