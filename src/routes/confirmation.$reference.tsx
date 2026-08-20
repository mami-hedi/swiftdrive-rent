import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Download } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_LABELS, eur, formatDateTime, type Reservation } from "@/lib/domain";
import { downloadReservationReceipt, receiptBreakdown, receiptNumber } from "@/lib/receipt";
import { fetchPublicReservation, fetchSettings } from "@/services/api";


export const Route = createFileRoute("/confirmation/$reference")({
  validateSearch: (search: Record<string, unknown>): { email?: string | undefined } => ({
    email: typeof search['email'] === "string" ? search['email'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Réservation confirmée — Velora Rent" },
      { name: "description", content: "Récapitulatif de votre réservation Velora Rent." },
      { property: "og:title", content: "Réservation confirmée — Velora Rent" },
      { property: "og:description", content: "Récapitulatif de votre réservation." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { reference } = Route.useParams();
  const { email } = Route.useSearch();
  const { data, isLoading } = useQuery({
    queryKey: ["reservation", reference, email],
    queryFn: (): Promise<Reservation | null> => fetchPublicReservation(reference, email ?? ""),
    enabled: Boolean(email),
  });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 300_000 });

  function downloadSummary() {
    if (!data) return;
    downloadReservationReceipt(data, settings ?? {});
  }




  return (
    <SiteLayout>
      <div className="container-page max-w-3xl py-16">
        {isLoading ? (
          <Skeleton className="h-96 rounded-3xl" />
        ) : !data ? (
          <div className="rounded-3xl border border-border p-12 text-center">
            <h1 className="text-2xl font-semibold">Réservation introuvable</h1>
            <p className="mt-3 text-muted-foreground">
              Vérifiez le lien reçu après votre réservation, ou contactez notre équipe avec votre numéro de réservation.
            </p>
            <Button asChild variant="accent" className="mt-6">
              <Link to="/contact">Contacter l'agence</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-8 shadow-lift md:p-12">
            <CheckCircle2 className="size-12 text-success" />
            <h1 className="mt-6 text-3xl font-semibold">Votre réservation a bien été enregistrée.</h1>
            <p className="mt-3 text-muted-foreground">
              Un email de confirmation vous sera envoyé à {data.email}. Notre équipe valide votre demande sous 24h.
            </p>

            <dl className="mt-10 grid gap-4 sm:grid-cols-2">
              <Item label="Numéro de réservation" value={data.reference} />
              <Item label="Numéro de reçu" value={receiptNumber(data)} />
              <Item label="Véhicule" value={`${data.vehicles?.brand} ${data.vehicles?.model}`} />
              <Item label="Départ" value={`${formatDateTime(data.start_at)} · ${data.pickup_location}`} />
              <Item label="Retour" value={`${formatDateTime(data.end_at)} · ${data.dropoff_location}`} />
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Statut</dt>
                <dd className="mt-1">
                  <Badge variant={data.status === "confirmed" ? "success" : "warning"}>
                    {STATUS_LABELS[data.status]}
                  </Badge>
                </dd>
              </div>
            </dl>

            {(() => {
              const b = receiptBreakdown(data, settings?.vat_rate ?? 20);
              return (
                <div className="mt-8 rounded-2xl border border-border p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Récapitulatif de paiement
                  </h2>
                  <dl className="mt-4 space-y-2 text-sm">
                    <Line label={`Location (${data.days} j × ${eur(Number(data.daily_rate))})`} value={eur(b.vehicleTtc)} />
                    <Line label="Options et suppléments" value={eur(b.optionsTtc)} />
                    <Line label="Total HT" value={eur(b.subtotalHt)} />
                    <Line label={`TVA (${b.rate}%)`} value={eur(b.vatAmount)} />
                    <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                      <span>Total TTC</span>
                      <span>{eur(b.total)}</span>
                    </div>
                    <Line label="Montant réglé" value={eur(b.paid)} />
                    <Line
                      label={data.status === "cancelled" ? "Montant annulé" : "Solde restant dû"}
                      value={eur(data.status === "cancelled" ? b.total : b.balance)}
                    />
                  </dl>
                </div>
              );
            })()}

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="accent">
                <Link to="/vehicules">Retour aux véhicules</Link>
              </Button>
              <Button variant="outline" onClick={downloadSummary}>
                <Download className="size-4" /> Télécharger le récapitulatif
              </Button>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
