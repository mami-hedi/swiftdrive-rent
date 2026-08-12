import { Link } from "@tanstack/react-router";
import { Fuel, Gauge, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { eur, type Vehicle } from "@/lib/domain";

export function VehicleCard({ vehicle, available = true }: { vehicle: Vehicle; available?: boolean }) {
  const image = vehicle.images?.[0] ?? "/images/cars/bmw-3.jpg";
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[3/2] overflow-hidden bg-surface">
        <img
          src={image}
          alt={`${vehicle.brand} ${vehicle.model} en location`}
          loading="lazy"
          width={1200}
          height={800}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant={available ? "success" : "muted"}>{available ? "Disponible" : "Indisponible"}</Badge>
          <Badge variant="outline" className="bg-background/90">{vehicle.category}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-lg font-semibold">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-sm text-muted-foreground">{vehicle.year}</p>
        </div>

        <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2"><Gauge className="size-4 text-accent" />{vehicle.transmission}</li>
          <li className="flex items-center gap-2"><Fuel className="size-4 text-accent" />{vehicle.fuel}</li>
          <li className="flex items-center gap-2"><Users className="size-4 text-accent" />{vehicle.seats} places</li>
          <li className="flex items-center gap-2"><Briefcase className="size-4 text-accent" />{vehicle.luggage} bagages</li>
        </ul>

        <div className="mt-auto flex items-end justify-between border-t border-border pt-4">
          <p className="text-2xl font-semibold">
            {eur(Number(vehicle.daily_price))}
            <span className="ml-1 text-sm font-normal text-muted-foreground">/ jour</span>
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/vehicules/$id" params={{ id: vehicle.id }}>Détails</Link>
            </Button>
            <Button asChild variant="accent" size="sm" disabled={!available}>
              <Link to="/reserver/$id" params={{ id: vehicle.id }}>Réserver</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
