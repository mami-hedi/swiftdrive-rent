import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SlidersHorizontal, CarFront } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SearchBar } from "@/components/site/SearchBar";
import { VehicleCard } from "@/components/site/VehicleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchAvailableIds, fetchVehicles } from "@/services/api";
import { CATEGORIES, FUELS, TRANSMISSIONS, formatDateTime } from "@/lib/domain";

interface VehicleSearch {
  start?: string;
  end?: string;
  pickup?: string;
}

export const Route = createFileRoute("/vehicules")({
  validateSearch: (search: Record<string, unknown>): VehicleSearch => ({
    start: typeof search['start'] === "string" ? search['start'] : undefined,
    end: typeof search['end'] === "string" ? search['end'] : undefined,
    pickup: typeof search['pickup'] === "string" ? search['pickup'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Nos véhicules à louer — Velora Rent" },
      {
        name: "description",
        content:
          "Parcourez notre flotte de citadines, berlines et SUV récents. Filtrez par marque, prix, transmission, carburant et disponibilité.",
      },
      { property: "og:title", content: "Nos véhicules à louer — Velora Rent" },
      { property: "og:description", content: "Citadines, berlines et SUV récents disponibles à la location." },
    ],
  }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const search = Route.useSearch();
  const { data: vehicles, isLoading } = useQuery({ queryKey: ["vehicles"], queryFn: fetchVehicles });

  const hasRange = Boolean(search.start && search.end);
  const { data: availableIds } = useQuery({
    queryKey: ["available", search.start, search.end],
    queryFn: () => fetchAvailableIds(search.start!, search.end!),
    enabled: hasRange,
  });

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fuel, setFuel] = useState("");
  const [seats, setSeats] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const brands = useMemo(
    () => Array.from(new Set((vehicles ?? []).map((v) => v.brand))).sort(),
    [vehicles],
  );

  const isAvailable = (id: string, status: string) =>
    hasRange ? (availableIds ?? []).includes(id) : status === "available";

  const filtered = (vehicles ?? []).filter((v) => {
    if (brand && v.brand !== brand) return false;
    if (model && !`${v.model}`.toLowerCase().includes(model.toLowerCase())) return false;
    if (category && v.category !== category) return false;
    if (transmission && v.transmission !== transmission) return false;
    if (fuel && v.fuel !== fuel) return false;
    if (seats && v.seats < Number(seats)) return false;
    if (minPrice && Number(v.daily_price) < Number(minPrice)) return false;
    if (maxPrice && Number(v.daily_price) > Number(maxPrice)) return false;
    if (onlyAvailable && !isAvailable(v.id, v.status)) return false;
    return true;
  });

  function reset() {
    setBrand("");
    setModel("");
    setCategory("");
    setTransmission("");
    setFuel("");
    setSeats("");
    setMinPrice("");
    setMaxPrice("");
    setOnlyAvailable(true);
  }

  const selectClass =
    "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring";

  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-12">
          <h1 className="text-3xl font-semibold md:text-4xl">Nos véhicules</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {hasRange
              ? `Disponibilités du ${formatDateTime(search.start!)} au ${formatDateTime(search.end!)}`
              : "Sélectionnez vos dates pour voir uniquement les véhicules disponibles."}
          </p>
          <div className="mt-8">
            <SearchBar variant="inline" defaults={search} />
          </div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-12 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Button
            variant="outline"
            className="mb-4 w-full lg:hidden"
            onClick={() => setShowFilters((s) => !s)}
          >
            <SlidersHorizontal className="size-4" /> Filtres
          </Button>

          <div
            className={`${showFilters ? "block" : "hidden"} space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft lg:block`}
          >
            <h2 className="font-display text-base font-semibold">Filtres</h2>

            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Marque</Label>
              <select className={selectClass} value={brand} onChange={(e) => setBrand(e.target.value)}>
                <option value="">Toutes</option>
                {brands.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Modèle</Label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ex : Golf" />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Catégorie</Label>
              <select className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Toutes</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Prix min</Label>
                <Input type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Prix max</Label>
                <Input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Transmission</Label>
              <select
                className={selectClass}
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              >
                <option value="">Toutes</option>
                {TRANSMISSIONS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Carburant</Label>
              <select className={selectClass} value={fuel} onChange={(e) => setFuel(e.target.value)}>
                <option value="">Tous</option>
                {FUELS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Places minimum</Label>
              <select className={selectClass} value={seats} onChange={(e) => setSeats(e.target.value)}>
                <option value="">Indifférent</option>
                <option value="2">2+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
                <option value="7">7+</option>
              </select>
            </div>

            <label className="flex items-center gap-2.5 pt-1 text-sm">
              <Checkbox
                checked={onlyAvailable}
                onCheckedChange={(c) => setOnlyAvailable(Boolean(c))}
              />
              Disponibles uniquement
            </label>

            <Button variant="ghost" className="w-full" onClick={reset}>
              Réinitialiser
            </Button>
          </div>
        </aside>

        <div>
          <p className="mb-6 text-sm text-muted-foreground">
            {isLoading ? "Chargement…" : `${filtered.length} véhicule(s) trouvé(s)`}
          </p>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <CarFront className="mx-auto mb-4 size-10 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Aucun véhicule ne correspond</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Modifiez vos filtres ou choisissez une autre période.
              </p>
              <Button variant="outline" className="mt-6" onClick={reset}>
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((v) => (
                <VehicleCard key={v.id} vehicle={v} available={isAvailable(v.id, v.status)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
