import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Questions fréquentes sur la location | Velora Rent" },
      { name: "description", content: "Âge minimum, documents nécessaires, annulation, kilométrage, carburant : toutes les réponses sur la location Velora Rent." },
      { property: "og:title", content: "FAQ — Velora Rent" },
      { property: "og:description", content: "Les réponses aux questions les plus fréquentes." },
    ],
  }),
  component: Faq,
});

const QA = [
  { q: "Quel âge minimum pour louer ?", a: "21 ans, avec un permis de conduire valide depuis au moins 2 ans." },
  { q: "Quels documents dois-je fournir ?", a: "Une pièce d'identité, votre permis de conduire et une carte bancaire au nom du conducteur." },
  { q: "Le kilométrage est-il limité ?", a: "Non, tous nos tarifs incluent le kilométrage illimité en France métropolitaine." },
  { q: "Puis-je annuler ma réservation ?", a: "Oui, gratuitement jusqu'à 48h avant le départ depuis votre espace client." },
  { q: "Puis-je ajouter un second conducteur ?", a: "Oui, via l'option « Conducteur supplémentaire » à 10 € par jour." },
  { q: "Comment fonctionne la caution ?", a: "Une empreinte bancaire est réalisée au départ et libérée sous 7 jours après restitution du véhicule." },
];

function Faq() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Aide" title="Questions fréquentes" subtitle="Tout ce qu'il faut savoir avant de réserver." />
      <section className="container-page max-w-3xl py-16">
        <Accordion type="single" collapsible className="w-full">
          {QA.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  );
}
