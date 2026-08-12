import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Velora Rent" },
      { name: "description", content: "Comment Velora Rent collecte, utilise et protège vos données personnelles." },
      { property: "og:title", content: "Politique de confidentialité — Velora Rent" },
      { property: "og:description", content: "Protection et usage de vos données personnelles." },
    ],
  }),
  component: Privacy,
});

const SECTIONS = [
  { t: "Données collectées", c: "Identité, coordonnées, numéro de permis et historique de réservations, nécessaires à l'exécution du contrat de location." },
  { t: "Finalités", c: "Gestion des réservations, facturation, assistance client et obligations légales." },
  { t: "Conservation", c: "Vos données sont conservées 3 ans après votre dernière location, puis supprimées ou anonymisées." },
  { t: "Vos droits", c: "Vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité en écrivant à contact@velora-rent.fr." },
  { t: "Sécurité", c: "Les données sont hébergées dans l'Union européenne et protégées par un contrôle d'accès strict au niveau de la base de données." },
];

function Privacy() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Juridique" title="Politique de confidentialité" />
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
