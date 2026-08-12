import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Check,
  DoorOpen,
  Fuel,
  Gauge,
  Users,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchBusyRanges, fetchLocations, fetchVehicle } from "@/services/api";
import {
  combineDateTime,
  effectiveDailyRate,
  eur,
  formatDate,
  rentalDays,
  toDateInput,
  type Vehicle,
} from "@/lib/domain";

export const Route = createFileRoute("/vehicules/$id")({
  head: () => ({
    meta: [
      { title: "Détail du véhicule — Velora Rent" },
      {
        name: "description",
        content: "Équipements, tarifs, disponibilités et réservation en ligne de ce véhicule.",
      },
      { property: "og:title", content: "Détail du véhicule — Velora Rent" },
      { property: "og:description", content: "Équipements, tarifs et disponibilités du véhicule." },
    ],
  }),
  component: VehicleDetail,
});

function VehicleDetail() {
  const { id } = Route.useParams();
  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => fetchVehicle(id),
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-page grid gap-8 py-12 lg:grid-cols-[1.4fr_1fr]">
          <Skeleton className="h-[420px] rounded-3xl" />
          <Skeleton className="h-[420px] rounded-3xl" />
        </div>
      </SiteLayout>
    );
  }

  if (error || !vehicle) {
    return (
      <SiteLayout>
        <div className="container-page py-24 text-center">
          <h1 className="text-2xl font-semibold">Véhicule introuvable</h1>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/vehicules">Retour aux véhicules</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-page py-8">
        <Link
          to="/vehicules"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Retour aux véhicules
        </Link>
      </div>
      <Detail vehicle={vehicle} />
    </SiteLayout>
  );
}

function Detail({ vehicle }: { vehicle: Vehicle }) {
  const navigate = useNavigate();
  const { data: busy = [] } = useQuery({
    queryKey: ["busy", vehicle.id],
    queryFn: () => fetchBusyRanges(vehicle.id),
  });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: fetchLocations });

  const [active, setActive] = useState(0);
  const [startDate, setStartDate] = useState(toDateInput(new Date(Date.now() + 86_400_000)));
  const [startTime, setStartTime] = useState("10:00");
  const [endDate, setEndDate] = useState(toDateInput(new Date(Date.now() + 5 * 86_400_000)));
  const [endTime, setEndTime] = useState("10:00");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const startIso = combineDateTime(startDate, startTime);
  const endIso = combineDateTime(endDate, endTime);
  const days = startIso && endIso ? rentalDays(startIso, endIso) : 0;
  const rate = effectiveDailyRate(vehicle, days || 1);
  const subtotal = days * rate;

  const conflict = busy.some(
    (b) => new Date(startIso) < new Date(b.end_at) && new Date(endIso) > new Date(b.start_at),
  );

  const images = vehicle.images?.length ? vehicle.images : ["/images/cars/bmw-3.jpg"];
  const specs = [
    { icon: Gauge, label: "Transmission", value: vehicle.transmission },
    { icon: Fuel, label: "Carburant", value: vehicle.fuel },
    { icon: Users, label: "Places", value: `${vehicle.seats}` },
    { icon: DoorOpen, label: "Portes", value: `${vehicle.doors}` },
    { icon: Briefcase, label: "Bagages", value: `${vehicle.luggage}` },
    { icon: CalendarDays, label: "Année", value: `${vehicle.year}` },
  ];

  const selectClass =
    "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring";

  function goToBooking() {
    navigate({
      to: "/reserver/$id",
      params: { id: vehicle.id },
      search: { start: startIso, end: endIso, pickup: pickup || undefined, dropoff: dropoff || undefined },
    });
  }

  return (
    <div className="container-page grid gap-10 pb-20 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <div className="overflow-hidden rounded-3xl border border-border bg-surface">
          <img
            src={images[active]}
            alt={`${vehicle.brand} ${vehicle.model}`}
            width={1200}
            height={800}
            className="aspect-[3/2] w-full object-cover"
          />
        </div>
        {images.length > 1 && (
          <div className="mt-4 flex gap-3">
            {images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActive(i)}
                className={`overflow-hidden rounded-xl border-2 transition-colors ${i === active ? "border-accent" : "border-transparent"}`}
              >
                <img src={img} alt="" width={160} height={107} className="h-20 w-28 object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Badge variant="accent">{vehicle.category}</Badge>
          <Badge variant={vehicle.status === "available" ? "success" : "muted"}>
            {vehicle.status === "available" ? "Disponible" : "Indisponible"}
          </Badge>
        </div>
        <h1 className="mt-4 text-3xl font-semibold md:text-4xl">
          {vehicle.brand} {vehicle.model}
        </h1>
        <p className="mt-2 text-muted-foreground">{vehicle.year} · {vehicle.mileage.toLocaleString("fr-FR")} km</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {specs.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <s.icon className="mb-2 size-4 text-accent" />
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="font-semibold">{s.value}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-xl font-semibold">Description</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{vehicle.description}</p>

        <h2 className="mt-10 text-xl font-semibold">Équipements</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {vehicle.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="size-4 text-accent" /> {f}
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-xl font-semibold">Périodes déjà réservées</h2>
        {busy.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Aucune réservation en cours : ce véhicule est libre sur les prochaines semaines.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {busy.map((b) => (
              <li
                key={b.start_at}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm"
              >
                <span>
                  {formatDate(b.start_at)} → {formatDate(b.end_at)}
                </span>
                <Badge variant="muted">Réservé</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* BLOC RESERVATION */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-lift">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{eur(Number(vehicle.daily_price))}</span>
            <span className="text-sm text-muted-foreground">/ jour</span>
          </div>
          {vehicle.weekly_price && (
            <p className="mt-1 text-sm text-muted-foreground">
              {eur(Number(vehicle.weekly_price))} / semaine · {eur(Number(vehicle.monthly_price ?? 0))} / mois
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Départ</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Heure</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Retour</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Heure</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Prise en charge</Label>
              <select className={selectClass} value={pickup} onChange={(e) => setPickup(e.target.value)}>
                <option value="">Choisir une agence</option>
                {locations.map((l) => (
                  <option key={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Restitution</Label>
              <select className={selectClass} value={dropoff} onChange={(e) => setDropoff(e.target.value)}>
                <option value="">Choisir une agence</option>
                {locations.map((l) => (
                  <option key={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Durée</dt>
              <dd>{days} jour(s)</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Prix journalier</dt>
              <dd>{eur(rate)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Sous-total</dt>
              <dd>{eur(subtotal)}</dd>
            </div>
          </dl>

          {conflict && (
            <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Ce véhicule n'est pas disponible pour cette période.
            </p>
          )}

          <Button
            variant="accent"
            size="lg"
            className="mt-5 w-full"
            disabled={conflict || days === 0 || vehicle.status !== "available"}
            onClick={goToBooking}
          >
            Réserver cette voiture
          </Button>

          {conflict && (
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link to="/vehicules" search={{ start: startIso, end: endIso }}>
                Voir les véhicules disponibles
              </Link>
            </Button>
          )}
        </div>
      </aside>
    </div>
  );
}
