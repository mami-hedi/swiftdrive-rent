import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAllReservations, fetchVehicles } from "@/services/api";
import { STATUS_LABELS, eur, formatDate } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: vehicles, isLoading: lv } = useQuery({ queryKey: ["vehicles"], queryFn: fetchVehicles });
  const { data: reservations, isLoading: lr } = useQuery({
    queryKey: ["all-reservations"],
    queryFn: fetchAllReservations,
  });

  if (lv || lr) return <Skeleton className="h-96 rounded-2xl" />;

  const v = vehicles ?? [];
  const r = reservations ?? [];
  const now = new Date();
  const monthly = r.filter(
    (x) => new Date(x.created_at).getMonth() === now.getMonth() && new Date(x.created_at).getFullYear() === now.getFullYear(),
  );
  const revenue = r
    .filter((x) => x.status !== "cancelled")
    .reduce((sum, x) => sum + Number(x.total), 0);

  const stats = [
    { label: "Véhicules", value: v.length },
    { label: "Disponibles", value: v.filter((x) => x.status === "available").length },
    { label: "En location", value: r.filter((x) => x.status === "ongoing").length },
    { label: "En attente", value: r.filter((x) => x.status === "pending").length },
    { label: "Confirmées", value: r.filter((x) => x.status === "confirmed").length },
    { label: "Réservations du mois", value: monthly.length },
    { label: "CA estimé", value: eur(revenue) },
  ];

  const byMonth = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const items = r.filter(
      (x) => new Date(x.created_at).getMonth() === d.getMonth() && new Date(x.created_at).getFullYear() === d.getFullYear(),
    );
    return {
      mois: d.toLocaleDateString("fr-FR", { month: "short" }),
      reservations: items.length,
      revenus: items.filter((x) => x.status !== "cancelled").reduce((s, x) => s + Number(x.total), 0),
    };
  });

  const topVehicles = Object.values(
    r.reduce<Record<string, { nom: string; locations: number }>>((acc, x) => {
      const key = `${x.vehicles?.brand} ${x.vehicles?.model}`;
      acc[key] = { nom: key, locations: (acc[key]?.locations ?? 0) + 1 };
      return acc;
    }, {}),
  )
    .sort((a, b) => b.locations - a.locations)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Tableau de bord</h1>
        <p className="mt-2 text-sm text-muted-foreground">Vue d'ensemble de l'activité Velora Rent.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Réservations par mois">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mois" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="reservations" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenus par mois (€)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mois" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="revenus" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Véhicules les plus loués">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topVehicles} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="nom" width={120} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="locations" fill="var(--color-chart-2)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 font-display text-base font-semibold">Réservations récentes</h2>
          <ul className="space-y-3">
            {r.slice(0, 6).map((x) => (
              <li key={x.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 text-sm last:border-0">
                <span>
                  <span className="block font-medium">
                    {x.first_name} {x.last_name}
                  </span>
                  <span className="text-muted-foreground">
                    {x.vehicles?.brand} {x.vehicles?.model} · {formatDate(x.start_at)}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold">{eur(Number(x.total))}</span>
                  <Badge variant={x.status === "confirmed" ? "success" : x.status === "cancelled" ? "destructive" : "warning"}>
                    {STATUS_LABELS[x.status]}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="mb-4 font-display text-base font-semibold">{title}</h2>
      {children}
    </div>
  );
}
