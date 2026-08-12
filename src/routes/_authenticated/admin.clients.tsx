import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchAllReservations } from "@/services/api";
import { STATUS_LABELS, eur, formatDate, type Reservation } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  component: AdminClients,
});

function AdminClients() {
  const { data, isLoading } = useQuery({ queryKey: ["all-reservations"], queryFn: fetchAllReservations });
  const [search, setSearch] = useState("");

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;

  const clients = Object.values(
    (data ?? []).reduce<Record<string, { name: string; email: string; phone: string; items: Reservation[] }>>(
      (acc, r) => {
        const key = r.email;
        const entry = acc[key] ?? { name: `${r.first_name} ${r.last_name}`, email: r.email, phone: r.phone, items: [] };
        entry.items.push(r);
        acc[key] = entry;
        return acc;
      },
      {},
    ),
  ).filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.includes(search));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Clients</h1>
        <p className="mt-2 text-sm text-muted-foreground">{clients.length} client(s)</p>
      </div>

      <Input placeholder="Rechercher un client…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {["Nom", "Email", "Téléphone", "Réservations", "Dernière", "Statut", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const last = c.items[0];
              return (
                <tr key={c.email} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3">{c.items.length}</td>
                  <td className="px-4 py-3">{last ? formatDate(last.start_at) : "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.items.some((i) => i.status === "ongoing") ? "success" : "muted"}>
                      {c.items.some((i) => i.status === "ongoing") ? "En location" : "Inactif"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">Fiche</Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{c.name}</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">{c.email} · {c.phone}</p>
                        <ul className="mt-4 space-y-3">
                          {c.items.map((r) => (
                            <li key={r.id} className="rounded-xl border border-border p-3 text-sm">
                              <div className="flex justify-between gap-3">
                                <span className="font-medium">{r.reference}</span>
                                <Badge variant={r.status === "confirmed" ? "success" : "warning"}>{STATUS_LABELS[r.status]}</Badge>
                              </div>
                              <p className="mt-1 text-muted-foreground">
                                {r.vehicles?.brand} {r.vehicles?.model} · {formatDate(r.start_at)} → {formatDate(r.end_at)} · {eur(Number(r.total))}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </DialogContent>
                    </Dialog>
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
