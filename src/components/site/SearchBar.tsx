import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchLocations } from "@/services/api";
import { combineDateTime, toDateInput } from "@/lib/domain";

interface Props {
  defaults?: { pickup?: string; start?: string; end?: string };
  variant?: "hero" | "inline";
}

export function SearchBar({ defaults, variant = "hero" }: Props) {
  const navigate = useNavigate();
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: fetchLocations });

  const tomorrow = new Date(Date.now() + 86_400_000);
  const inFourDays = new Date(Date.now() + 5 * 86_400_000);

  const [pickup, setPickup] = useState(defaults?.pickup ?? "");
  const [startDate, setStartDate] = useState(defaults?.start?.slice(0, 10) ?? toDateInput(tomorrow));
  const [startTime, setStartTime] = useState("10:00");
  const [endDate, setEndDate] = useState(defaults?.end?.slice(0, 10) ?? toDateInput(inFourDays));
  const [endTime, setEndTime] = useState("10:00");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({
      to: "/vehicules",
      search: {
        pickup: pickup || undefined,
        start: combineDateTime(startDate, startTime),
        end: combineDateTime(endDate, endTime),
      },
    });
  }

  return (
    <form
      onSubmit={submit}
      className={
        variant === "hero"
          ? "grid gap-4 rounded-2xl border border-border bg-card/95 p-5 shadow-lift backdrop-blur md:grid-cols-3 lg:grid-cols-6"
          : "grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft md:grid-cols-3 lg:grid-cols-6"
      }
    >
      <div className="lg:col-span-2">
        <Label htmlFor="pickup" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Lieu de prise en charge
        </Label>
        <select
          id="pickup"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Toutes les agences</option>
          {locations.map((l) => (
            <option key={l.id} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="sd" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Date de départ
        </Label>
        <Input id="sd" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="st" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Heure
        </Label>
        <Input id="st" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="ed" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Date de retour
        </Label>
        <Input id="ed" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="et" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Heure
        </Label>
        <Input id="et" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
      </div>

      <Button type="submit" variant="accent" size="lg" className="w-full lg:col-span-6">
        <Search className="size-4" /> Rechercher un véhicule
      </Button>
    </form>
  );
}
