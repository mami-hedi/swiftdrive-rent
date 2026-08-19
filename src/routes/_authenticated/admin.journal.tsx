import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { fetchAuditLogs } from "@/services/api";
import { AUDIT_ACTION_LABELS, formatDateTime, type AuditLog } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/admin/journal")({
  component: AdminJournal,
});

function actionVariant(action: string) {
  if (action.endsWith("cancelled") || action.endsWith("deleted")) return "destructive" as const;
  if (action.endsWith("confirmed") || action.endsWith("completed")) return "success" as const;
  return "muted" as const;
}

function AdminJournal() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["audit-logs"], queryFn: () => fetchAuditLogs() });
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [action, setAction] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const channel = supabase
      .channel("audit-logs-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "audit_logs" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const logs: AuditLog[] = data ?? [];

  const actions = useMemo(() => Array.from(new Set(logs.map((l) => l.action))).sort(), [logs]);

  const filtered = logs.filter((l) => {
    if (type !== "all" && l.entity_type !== type) return false;
    if (action !== "all" && l.action !== action) return false;
    if (from && new Date(l.created_at) < new Date(`${from}T00:00:00`)) return false;
    if (to && new Date(l.created_at) > new Date(`${to}T23:59:59`)) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${l.actor_email ?? ""} ${l.entity_label ?? ""} ${l.action} ${l.reason ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const reset = () => {
    setSearch("");
    setType("all");
    setAction("all");
    setFrom("");
    setTo("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold md:text-3xl">
            <History className="size-6" /> Journal d’audit
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Historique des actions (confirmations, annulations, modifications de flotte) — {filtered.length} entrée(s).
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Temps réel
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
        <Input
          placeholder="Rechercher (auteur, élément, motif)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="reservation">Réservations</SelectItem>
            <SelectItem value="vehicle">Véhicules</SelectItem>
          </SelectContent>
        </Select>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les actions</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>{AUDIT_ACTION_LABELS[a] ?? a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Du</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Au</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="mr-2 size-4" /> Réinitialiser
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Aucune action enregistrée pour ces critères.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {["Date", "Action", "Élément", "Auteur", "Changement", "Motif"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDateTime(l.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={actionVariant(l.action)}>{AUDIT_ACTION_LABELS[l.action] ?? l.action}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">{l.entity_label ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.actor_email ?? "Système / client"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {l.old_value ? `${l.old_value} → ${l.new_value ?? "—"}` : (l.new_value ?? "—")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
