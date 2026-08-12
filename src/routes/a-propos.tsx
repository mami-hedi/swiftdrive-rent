import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos de Velora Rent — Loueur automobile" },
      { name: "description", content: "Velora Rent loue des véhicules récents en France depuis 2014 : 6 agences, une flotte renouvelée et un service客 attentif." },
      { property: "og:title", content: "À propos de Velora Rent" },
      { property: "og:description", content: "Un loueur automobile indépendant, 6 agences en France." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Notre histoire"
        title="Un loueur automobile pensé pour la simplicité"
        subtitle="Depuis 2014, Velora Rent accompagne particuliers et entreprises avec une flotte récente et des tarifs clairs."
      />
      <section className="container-page grid gap-12 py-16 lg:grid-cols-2">
        <div className="space-y-4 text-muted-foreground">
          <p>
            Née à Paris, Velora Rent est une société indépendante de location de véhicules. Notre conviction :
            louer une voiture doit être aussi simple que réserver un train.
          </p>
          <p>
            Nous exploitons aujourd'hui 6 agences en France et une flotte de plus de 120 véhicules renouvelée
            chaque année, du citadin électrique au SUV 7 places.
          </p>
          <p>
            Chaque véhicule est contrôlé, nettoyé et assuré avant chaque départ. Nos conseillers restent
            joignables 7j/7 pendant toute la durée de votre location.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[
            { k: "2014", v: "Année de création" },
            { k: "6", v: "Agences en France" },
            { k: "120+", v: "Véhicules en flotte" },
            { k: "4,8/5", v: "Satisfaction client" },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
              <p className="font-display text-3xl font-semibold text-accent">{s.k}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
