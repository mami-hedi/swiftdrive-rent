import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  CalendarDays,
  CarFront,
  ClipboardList,
  LayoutDashboard,
  Settings,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const LINKS = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/vehicules", label: "Véhicules", icon: CarFront, exact: false },
  { to: "/admin/reservations", label: "Réservations", icon: ClipboardList, exact: false },
  { to: "/admin/calendrier", label: "Calendrier", icon: CalendarDays, exact: false },
  { to: "/admin/clients", label: "Clients", icon: Users, exact: false },
  { to: "/admin/options", label: "Options", icon: SlidersHorizontal, exact: false },
  { to: "/admin/parametres", label: "Paramètres", icon: Settings, exact: false },
] as const;

function AdminLayout() {
  const { isStaff, loading, roles } = useAuth();

  if (loading || (!isStaff && roles.length === 0)) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Chargement…</div>;
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">Accès refusé</h1>
        <p className="max-w-md text-muted-foreground">
          Cet espace est réservé aux administrateurs et managers de Velora Rent.
        </p>
        <Button asChild variant="accent">
          <Link to="/">Retour au site</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 text-sidebar-foreground lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <CarFront className="size-5" />
          </span>
          <span className="font-display font-semibold">Velora Admin</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <l.icon className="size-4" /> {l.label}
            </Link>
          ))}
        </nav>
        <Button asChild variant="outline" size="sm" className="mt-6 bg-transparent text-sidebar-foreground">
          <Link to="/">Voir le site</Link>
        </Button>
      </aside>

      <div className="flex-1 overflow-x-hidden">
        <nav className="flex gap-2 overflow-x-auto border-b border-border bg-background p-3 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              activeProps={{ className: "bg-muted text-foreground" }}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-muted-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-5 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
