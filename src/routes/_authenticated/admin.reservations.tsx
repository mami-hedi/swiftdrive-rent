import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllReservations } from "@/services/api";
import { STATUS_LABELS, eur, formatDate, type ReservationStatus } from "@/lib/domain";

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

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReservationStatus }) => {
      const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Réservation mise à jour.");
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
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.status === "pending" && (
                      <Button size="sm" variant="accent" onClick={() => update.mutate({ id: r.id, status: "confirmed" })}>
                        Confirmer
                      </Button>
                    )}
                    {r.status === "confirmed" && (
                      <Button size="sm" variant="outline" onClick={() => update.mutate({ id: r.id, status: "ongoing" })}>
                        Démarrer
                      </Button>
                    )}
                    {r.status === "ongoing" && (
                      <Button size="sm" variant="outline" onClick={() => update.mutate({ id: r.id, status: "completed" })}>
                        Terminer
                      </Button>
                    )}
                    {r.status !== "cancelled" && r.status !== "completed" && (
                      <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: r.id, status: "cancelled" })}>
                        Annuler
                      </Button>
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
