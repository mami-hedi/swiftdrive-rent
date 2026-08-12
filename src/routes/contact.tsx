import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Clock, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Velora Rent" },
      { name: "description", content: "Contactez Velora Rent : téléphone, email, adresse, horaires et formulaire de contact." },
      { property: "og:title", content: "Contact — Velora Rent" },
      { property: "og:description", content: "Une question ? Notre équipe vous répond 7j/7." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(form);
    setLoading(false);
    if (error) {
      toast.error("Votre message n'a pas pu être envoyé.");
      return;
    }
    toast.success("Message envoyé, nous vous répondons sous 24h.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  return (
    <SiteLayout>
      <PageHero eyebrow="Contact" title="Parlons de votre location" subtitle="Notre équipe vous répond 7j/7." />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Nom</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Téléphone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Sujet</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Message</Label>
              <Textarea rows={6} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
          </div>
          <Button type="submit" variant="accent" size="lg" className="mt-6" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />} Envoyer le message
          </Button>
        </form>

        <div className="space-y-4">
          {[
            { icon: Phone, label: "Téléphone", value: "+33 1 84 60 22 10" },
            { icon: Mail, label: "Email", value: "contact@velora-rent.fr" },
            { icon: MapPin, label: "Adresse", value: "18 Avenue des Champs, 75008 Paris" },
            { icon: Clock, label: "Horaires", value: "Lun-Ven 8h-20h · Sam 9h-18h · Dim 10h-16h" },
          ].map((i) => (
            <div key={i.label} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
                <i.icon className="size-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{i.label}</p>
                <p className="font-medium">{i.value}</p>
              </div>
            </div>
          ))}
          <iframe
            title="Carte de l'agence Velora Rent Paris"
            src="https://www.google.com/maps?q=18+Avenue+des+Champs-Elysees+Paris&output=embed"
            loading="lazy"
            className="h-72 w-full rounded-2xl border border-border"
          />
        </div>
      </section>
    </SiteLayout>
  );
}
