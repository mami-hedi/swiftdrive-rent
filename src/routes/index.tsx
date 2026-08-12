import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Headphones,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import heroCar from "@/assets/hero-car.jpg";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SearchBar } from "@/components/site/SearchBar";
import { VehicleCard } from "@/components/site/VehicleCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchVehicles } from "@/services/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Velora Rent — Louez votre voiture en toute simplicité" },
      {
        name: "description",
        content:
          "Location de voitures premium en France : véhicules récents, tarifs transparents et réservation en ligne en 2 minutes.",
      },
      { property: "og:title", content: "Velora Rent — Location de voitures premium" },
      {
        property: "og:description",
        content: "Des véhicules fiables, des tarifs transparents et une réservation rapide.",
      },
    ],
  }),
  component: Home,
});

const ADVANTAGES = [
  { icon: CalendarCheck, title: "Réservation rapide", text: "Un parcours en 5 étapes, confirmé en moins de 2 minutes." },
  { icon: Sparkles, title: "Véhicules récents", text: "Une flotte renouvelée chaque année, entretenue et contrôlée." },
  { icon: Wallet, title: "Prix transparents", text: "Aucun frais caché : le prix affiché est le prix payé." },
  { icon: Headphones, title: "Assistance client", text: "Une équipe joignable 7j/7 avant, pendant et après la location." },
  { icon: ShieldCheck, title: "Paiement sécurisé", text: "Transactions chiffrées et données protégées." },
];

function Home() {
  const { data: vehicles, isLoading } = useQuery({ queryKey: ["vehicles"], queryFn: fetchVehicles });
  const featured = (vehicles ?? []).slice(0, 6);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="container-page grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
          <div className="fade-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <BadgeCheck className="size-3.5 text-accent" /> +12 000 locations réalisées
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] md:text-6xl">
              Louez votre voiture <span className="text-accent">en toute simplicité</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Des véhicules fiables, des tarifs transparents et une réservation rapide.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="accent" size="lg">
                <Link to="/vehicules">
                  Voir les véhicules <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/comment-ca-marche">Comment ça marche</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-accent/10 blur-2xl" />
            <img
              src={heroCar}
              alt="Berline premium disponible à la location chez Velora Rent"
              width={1600}
              height={1008}
              className="w-full rounded-3xl object-cover shadow-lift"
            />
          </div>
        </div>

        <div className="container-page pb-14">
          <SearchBar />
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="container-page py-16 md:py-24">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-semibold md:text-4xl">Pourquoi choisir Velora</h2>
          <p className="mt-3 text-muted-foreground">
            Une expérience de location pensée pour être simple, claire et sans mauvaise surprise.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {ADVANTAGES.map((a) => (
            <div
              key={a.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent/12 text-accent">
                <a.icon className="size-5" />
              </span>
              <h3 className="text-base font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FLOTTE */}
      <section className="border-y border-border bg-surface py-16 md:py-24">
        <div className="container-page">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold md:text-4xl">Notre flotte</h2>
              <p className="mt-3 text-muted-foreground">Citadines, berlines et SUV récents, prêts à partir.</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/vehicules">
                Tous les véhicules <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />)
              : featured.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 md:py-24">
        <div className="overflow-hidden rounded-3xl bg-primary px-8 py-14 text-primary-foreground md:px-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold md:text-4xl">Prêt à prendre la route ?</h2>
            <p className="mt-4 text-primary-foreground/70">
              Réservez en ligne, récupérez votre véhicule dans l'une de nos 6 agences et partez l'esprit tranquille.
            </p>
            <Button asChild variant="accent" size="lg" className="mt-8">
              <Link to="/vehicules">Réserver maintenant</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
