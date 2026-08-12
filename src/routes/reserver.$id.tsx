import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchLocations, fetchOptions, fetchVehicle } from "@/services/api";
import {
  combineDateTime,
  effectiveDailyRate,
  eur,
  formatDateTime,
  rentalDays,
  toDateInput,
} from "@/lib/domain";

interface BookingSearch {
  start?: string;
  end?: string;
  pickup?: string;
  dropoff?: string;
}

export const Route = createFileRoute("/reserver/$id")({
  validateSearch: (search: Record<string, unknown>): BookingSearch => ({
    start: typeof search['start'] === "string" ? search['start'] : undefined,
    end: typeof search['end'] === "string" ? search['end'] : undefined,
    pickup: typeof search['pickup'] === "string" ? search['pickup'] : undefined,
    dropoff: typeof search['dropoff'] === "string" ? search['dropoff'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Réserver un véhicule — Velora Rent" },
      { name: "description", content: "Finalisez votre réservation en 5 étapes : dates, informations, options et confirmation." },
      { property: "og:title", content: "Réserver un véhicule — Velora Rent" },
      { property: "og:description", content: "Réservation en ligne rapide et sécurisée." },
    ],
  }),
  component: BookingPage,
});

const STEPS = ["Véhicule", "Location", "Informations", "Options", "Résumé"];

function BookingPage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const { data: vehicle, isLoading } = useQuery({ queryKey: ["vehicle", id], queryFn: () => fetchVehicle(id) });
  const { data: options = [] } = useQuery({ queryKey: ["options"], queryFn: fetchOptions });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: fetchLocations });

  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState(search.start?.slice(0, 10) ?? toDateInput(new Date(Date.now() + 86_400_000)));
  const [startTime, setStartTime] = useState(search.start ? new Date(search.start).toTimeString().slice(0, 5) : "10:00");
  const [endDate, setEndDate] = useState(search.end?.slice(0, 10) ?? toDateInput(new Date(Date.now() + 5 * 86_400_000)));
  const [endTime, setEndTime] = useState(search.end ? new Date(search.end).toTimeString().slice(0, 5) : "10:00");
  const [pickup, setPickup] = useState(search.pickup ?? "");
  const [dropoff, setDropoff] = useState(search.dropoff ?? "");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [license, setLicense] = useState("");

  const [selected, setSelected] = useState<string[]>([]);
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEmail((v) => v || user.email || "");
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setFirstName((v) => v || data.first_name || "");
        setLastName((v) => v || data.last_name || "");
        setPhone((v) => v || data.phone || "");
        setAddress((v) => v || data.address || "");
        setLicense((v) => v || data.license_number || "");
      });
  }, [user]);

  const startIso = combineDateTime(startDate, startTime);
  const endIso = combineDateTime(endDate, endTime);
  const days = startIso && endIso ? rentalDays(startIso, endIso) : 0;
  const rate = vehicle ? effectiveDailyRate(vehicle, days || 1) : 0;
  const chosen = options.filter((o) => selected.includes(o.id));
  const optionsPerDay = chosen.reduce((sum, o) => sum + Number(o.price_per_day), 0);
  const optionsTotal = optionsPerDay * days;
  const subtotal = rate * days;
  const total = subtotal + optionsTotal;

  const selectClass =
    "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring";

  async function submit() {
    if (!user || !vehicle) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        user_id: user.id,
        vehicle_id: vehicle.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        address,
        license_number: license,
        pickup_location: pickup || "Paris Centre",
        dropoff_location: dropoff || pickup || "Paris Centre",
        start_at: startIso,
        end_at: endIso,
        days,
        daily_rate: rate,
        options_total: optionsTotal,
        total,
      })
      .select("id, reference")
      .maybeSingle();

    if (error || !data) {
      setSubmitting(false);
      const conflict = error?.message?.includes("reservations_no_overlap");
      toast.error(
        conflict
          ? "Ce véhicule n'est pas disponible pour cette période."
          : (error?.message ?? "La réservation n'a pas pu être enregistrée."),
      );
      return;
    }

    if (chosen.length) {
      await supabase.from("reservation_options").insert(
        chosen.map((o) => ({
          reservation_id: data.id,
          option_id: o.id,
          name: o.name,
          price_per_day: o.price_per_day,
        })),
      );
    }

    toast.success("Réservation enregistrée !");
    navigate({ to: "/confirmation/$reference", params: { reference: data.reference } });
  }

  if (isLoading || authLoading) {
    return (
      <SiteLayout>
        <div className="container-page py-16">
          <Skeleton className="h-[500px] rounded-3xl" />
        </div>
      </SiteLayout>
    );
  }

  if (!vehicle) {
    return (
      <SiteLayout>
        <div className="container-page py-24 text-center">
          <h1 className="text-2xl font-semibold">Véhicule introuvable</h1>
        </div>
      </SiteLayout>
    );
  }

  const canNext =
    (step === 2 && days > 0 && pickup && dropoff) ||
    (step === 3 && firstName && lastName && email && phone && license) ||
    step === 1 ||
    step === 4;

  return (
    <SiteLayout>
      <div className="container-page py-12">
        <h1 className="text-3xl font-semibold md:text-4xl">Réservation</h1>

        {/* Stepper */}
        <ol className="mt-8 flex flex-wrap gap-3">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const current = n === step;
            return (
              <li
                key={label}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                  current
                    ? "border-accent bg-accent/10 font-semibold text-accent"
                    : done
                      ? "border-border bg-muted text-foreground"
                      : "border-border text-muted-foreground"
                }`}
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-background text-xs">
                  {done ? <Check className="size-3" /> : n}
                </span>
                {label}
              </li>
            );
          })}
        </ol>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold">Votre véhicule</h2>
                <div className="mt-6 flex flex-col gap-5 sm:flex-row">
                  <img
                    src={vehicle.images?.[0] ?? "/images/cars/bmw-3.jpg"}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    width={1200}
                    height={800}
                    loading="lazy"
                    className="h-40 w-full rounded-2xl object-cover sm:w-64"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.year} · {vehicle.category} · {vehicle.transmission} · {vehicle.fuel}
                    </p>
                    <p className="mt-4 text-2xl font-semibold">
                      {eur(Number(vehicle.daily_price))}
                      <span className="text-sm font-normal text-muted-foreground"> / jour</span>
                    </p>
                    <Button asChild variant="ghost" size="sm" className="mt-3 px-0">
                      <Link to="/vehicules">Changer de véhicule</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold">Informations de location</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Date de départ</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Heure de départ</Label>
                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Date de retour</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Heure de retour</Label>
                    <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Prise en charge</Label>
                    <select className={selectClass} value={pickup} onChange={(e) => setPickup(e.target.value)}>
                      <option value="">Choisir une agence</option>
                      {locations.map((l) => (
                        <option key={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Restitution</Label>
                    <select className={selectClass} value={dropoff} onChange={(e) => setDropoff(e.target.value)}>
                      <option value="">Choisir une agence</option>
                      {locations.map((l) => (
                        <option key={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {days === 0 && (
                  <p className="mt-4 text-sm text-destructive">La date de retour doit être après la date de départ.</p>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold">Vos informations</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Prénom</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Nom</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Téléphone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Adresse</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">
                      Numéro de permis de conduire
                    </Label>
                    <Input value={license} onChange={(e) => setLicense(e.target.value)} required />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-xl font-semibold">Options supplémentaires</h2>
                <div className="mt-6 space-y-3">
                  {options.filter((o) => o.active).map((o) => (
                    <label
                      key={o.id}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-4 transition-colors hover:border-accent"
                    >
                      <span className="flex items-center gap-3">
                        <Checkbox
                          checked={selected.includes(o.id)}
                          onCheckedChange={(c) =>
                            setSelected((prev) => (c ? [...prev, o.id] : prev.filter((x) => x !== o.id)))
                          }
                        />
                        <span>
                          <span className="block font-medium">{o.name}</span>
                          <span className="block text-sm text-muted-foreground">{o.description}</span>
                        </span>
                      </span>
                      <span className="font-semibold">{eur(Number(o.price_per_day))} / jour</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-xl font-semibold">Résumé de votre réservation</h2>
                <dl className="mt-6 space-y-3 text-sm">
                  <Row label="Véhicule" value={`${vehicle.brand} ${vehicle.model} (${vehicle.year})`} />
                  <Row label="Départ" value={formatDateTime(startIso)} />
                  <Row label="Retour" value={formatDateTime(endIso)} />
                  <Row label="Prise en charge" value={pickup} />
                  <Row label="Restitution" value={dropoff} />
                  <Row label="Durée" value={`${days} jour(s)`} />
                  <Row label="Client" value={`${firstName} ${lastName} · ${email}`} />
                  <Row label="Prix journalier" value={eur(rate)} />
                  {chosen.map((o) => (
                    <Row key={o.id} label={o.name} value={`${eur(Number(o.price_per_day) * days)}`} />
                  ))}
                  <div className="flex justify-between border-t border-border pt-4 text-lg font-semibold">
                    <dt>Total</dt>
                    <dd>{eur(total)}</dd>
                  </div>
                </dl>

                <label className="mt-6 flex items-start gap-3 text-sm">
                  <Checkbox checked={terms} onCheckedChange={(c) => setTerms(Boolean(c))} />
                  <span>
                    J'accepte les <Link to="/terms" className="text-accent underline">conditions générales de location</Link>.
                  </span>
                </label>

                {!user && (
                  <div className="mt-6 rounded-xl bg-muted p-4 text-sm">
                    Connectez-vous pour finaliser votre réservation et la retrouver dans votre espace client.
                    <Button asChild variant="accent" size="sm" className="ml-3">
                      <Link to="/auth">Se connecter</Link>
                    </Button>
                  </div>
                )}

                <Button
                  variant="accent"
                  size="lg"
                  className="mt-6 w-full"
                  disabled={!terms || !user || submitting || days === 0}
                  onClick={submit}
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />} Confirmer la réservation
                </Button>
              </div>
            )}

            <div className="mt-8 flex justify-between border-t border-border pt-6">
              <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
                Précédent
              </Button>
              {step < 5 && (
                <Button variant="accent" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                  Continuer
                </Button>
              )}
            </div>
          </div>

          {/* Récap latéral */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-surface p-6">
              <h2 className="font-display text-base font-semibold">Votre devis</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Durée" value={`${days} jour(s)`} />
                <Row label="Sous-total" value={eur(subtotal)} />
                <Row label="Options" value={eur(optionsTotal)} />
                <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
                  <dt>Total</dt>
                  <dd>{eur(total)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
