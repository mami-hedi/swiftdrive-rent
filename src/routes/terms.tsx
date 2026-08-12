import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Conditions générales de location — Velora Rent" },
      { name: "description", content: "Conditions générales de location Velora Rent : âge minimum, permis, franchise, carburant et annulation." },
      { property: "og:title", content: "Conditions générales de location — Velora Rent" },
      { property: "og:description", content: "Les règles de nos contrats de location." },
    ],
  }),
  component: Terms,
});

const SECTIONS = [
  { t: "1. Conditions du locataire", c: "Le locataire doit être âgé de 21 ans minimum et détenir un permis de conduire valide depuis au moins 2 ans." },
  { t: "2. Réservation", c: "Toute réservation est confirmée après validation par nos équipes. Le véhicule est bloqué sur la période choisie dès l'enregistrement de la demande." },
  { t: "3. Tarifs", c: "Les tarifs affichés s'entendent TTC, kilométrage illimité inclus, hors options et carburant." },
  { t: "4. Carburant", c: "Le véhicule est restitué avec le même niveau de carburant qu'au départ, sous peine de facturation complémentaire." },
  { t: "5. Assurance et franchise", c: "Tous nos véhicules sont assurés tous risques. La franchise peut être ramenée à 0 € via l'option Assurance premium." },
  { t: "6. Annulation", c: "L'annulation est gratuite jusqu'à 48h avant le départ. Au-delà, une indemnité équivalente à une journée de location est retenue." },
];

function Terms() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Juridique" title="Conditions générales de location" />
      <section className="container-page max-w-3xl space-y-8 py-16">
        {SECTIONS.map((s) => (
          <article key={s.t}>
            <h2 className="text-lg font-semibold">{s.t}</h2>
            <p className="mt-2 text-muted-foreground">{s.c}</p>
          </article>
        ))}
      </section>
    </SiteLayout>
  );
}
