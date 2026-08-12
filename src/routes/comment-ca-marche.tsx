import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, CarFront, KeyRound, Search } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/comment-ca-marche")({
  head: () => ({
    meta: [
      { title: "Comment ça marche — Velora Rent" },
      { name: "description", content: "Louer une voiture chez Velora en 4 étapes : recherche, choix, réservation et retrait." },
      { property: "og:title", content: "Comment ça marche — Velora Rent" },
      { property: "og:description", content: "Louer une voiture en 4 étapes simples." },
    ],
  }),
  component: HowItWorks,
});

const STEPS = [
  { icon: Search, title: "1. Recherchez", text: "Indiquez votre agence, vos dates et heures de départ et de retour." },
  { icon: CarFront, title: "2. Choisissez", text: "Comparez les véhicules disponibles et leurs tarifs, sans frais cachés." },
  { icon: CalendarCheck, title: "3. Réservez", text: "Renseignez vos informations, ajoutez vos options et validez en ligne." },
  { icon: KeyRound, title: "4. Roulez", text: "Récupérez les clés en agence avec votre permis et votre pièce d'identité." },
];

function HowItWorks() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Parcours client"
        title="Comment ça marche"
        subtitle="Quatre étapes suffisent pour prendre la route avec un véhicule récent et entretenu."
      />
      <section className="container-page grid gap-6 py-16 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent/12 text-accent">
              <s.icon className="size-5" />
            </span>
            <h2 className="text-base font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </section>
      <section className="container-page pb-20">
        <Button asChild variant="accent" size="lg">
          <Link to="/vehicules">Trouver mon véhicule</Link>
        </Button>
      </section>
    </SiteLayout>
  );
}
