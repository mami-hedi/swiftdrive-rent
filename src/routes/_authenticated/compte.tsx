import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarClock, CheckCircle2, Download, Layers } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyReservations, fetchSettings } from "@/services/api";
import { useRealtimeReservations } from "@/hooks/useRealtimeReservations";
import { ReservationStatusTimeline } from "@/components/site/ReservationStatusTimeline";
import { STATUS_LABELS, eur, formatDateTime, type Reservation } from "@/lib/domain";
import { downloadReservationReceipt } from "@/lib/receipt";


export const Route = createFileRoute("/_authenticated/compte")({
  head: () => ({
    meta: [
      { title: "Mon espace client — Velora Rent" },
      { name: "description", content: "Suivez vos réservations, votre profil et vos récapitulatifs de location." },
      { property: "og:title", content: "Mon espace client — Velora Rent" },
      { property: "og:description", content: "Vos réservations Velora Rent en un coup d'œil." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientArea,
});

function ClientArea() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: reservations, isLoading } = useQuery({
    queryKey: ["my-reservations", user?.id],
    queryFn: () => fetchMyReservations(user!.id),
    enabled: Boolean(user),
  });

  useRealtimeReservations((payload) => {
    const next = payload.new as { user_id?: string; status?: string; reference?: string } | null;
    if (!next || next.user_id !== user?.id) return;
    if (next.status === "confirmed") toast.success(`Réservation ${next.reference} confirmée par notre équipe.`);
    if (next.status === "cancelled") toast.warning(`Réservation ${next.reference} annulée.`);
    if (next.status === "ongoing") toast.info(`Location ${next.reference} démarrée. Bonne route !`);
  });

  const [profile, setProfile] = useState({ first_name: "", last_name: "", phone: "", address: "", license_number: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data)
        setProfile({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          license_number: data.license_number ?? "",
        });
    });
  }, [user]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update(profile).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => toast.success("Profil mis à jour."),
    onError: () => toast.error("Mise à jour impossible."),
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reservations")
        .update({ status: "cancelled", cancellation_reason: "Annulée par le client" } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Réservation annulée.");
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["busy-ranges"] });
    },
    onError: () => toast.error("Annulation impossible."),
  });

  const list = reservations ?? [];
  const upcoming = list.filter((r) => new Date(r.start_at) > new Date() && r.status !== "cancelled");
  const done = list.filter((r) => r.status === "completed");

  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-12">
          <h1 className="text-3xl font-semibold md:text-4xl">
            Bonjour {profile.first_name || user?.email?.split("@")[0]}
          </h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Stat icon={Layers} label="Réservations totales" value={list.length} />
            <Stat icon={CalendarClock} label="À venir" value={upcoming.length} />
            <Stat icon={CheckCircle2} label="Terminées" value={done.length} />
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <Tabs defaultValue="reservations">
          <TabsList>
            <TabsTrigger value="reservations">Mes réservations</TabsTrigger>
            <TabsTrigger value="profile">Mon profil</TabsTrigger>
          </TabsList>

          <TabsContent value="reservations" className="mt-8 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
            ) : list.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center">
                <p className="text-muted-foreground">Vous n'avez pas encore de réservation.</p>
                <Button asChild variant="accent" className="mt-6">
                  <Link to="/vehicules" search={{}}>Réserver un véhicule</Link>
                </Button>
              </div>
            ) : (
              list.map((r) => <ReservationCard key={r.id} r={r} onCancel={() => cancel.mutate(r.id)} />)
            )}
          </TabsContent>

          <TabsContent value="profile" className="mt-8 max-w-2xl">
            <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
              {(
                [
                  ["first_name", "Prénom"],
                  ["last_name", "Nom"],
                  ["phone", "Téléphone"],
                  ["license_number", "Permis de conduire"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">{label}</Label>
                  <Input value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Adresse</Label>
                <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
              </div>
              <Button
                variant="accent"
                className="sm:col-span-2"
                disabled={saveProfile.isPending}
                onClick={() => saveProfile.mutate()}
              >
                Enregistrer
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <Icon className="mb-3 size-5 text-accent" />
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ReservationCard({ r, onCancel }: { r: Reservation; onCancel: () => void }) {
  const canCancel = r.status === "pending" || r.status === "confirmed";
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 300_000 });
  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-soft sm:flex-row">
      <img
        src={r.vehicles?.images?.[0] ?? "/images/cars/bmw-3.jpg"}
        alt={`${r.vehicles?.brand} ${r.vehicles?.model}`}
        loading="lazy"
        width={1200}
        height={800}
        className="h-32 w-full rounded-xl object-cover sm:w-48"
      />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">
            {r.vehicles?.brand} {r.vehicles?.model}
          </h2>
          <Badge variant={r.status === "cancelled" ? "destructive" : r.status === "confirmed" ? "success" : "warning"}>
            {STATUS_LABELS[r.status]}
          </Badge>
          <span className="text-xs text-muted-foreground">{r.reference}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatDateTime(r.start_at)} → {formatDateTime(r.end_at)} · {r.days} jour(s)
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {r.pickup_location} → {r.dropoff_location}
        </p>
        <p className="mt-3 text-xl font-semibold">{eur(Number(r.total))}</p>
        <div className="mt-4">
          <ReservationStatusTimeline
            status={r.status}
            confirmedAt={r.confirmed_at}
            cancelledAt={r.cancelled_at}
            cancellationReason={r.cancellation_reason}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:justify-center">
        <Button asChild variant="outline" size="sm">
          <Link to="/confirmation/$reference" params={{ reference: r.reference }}>
            <Download className="size-4" /> Récapitulatif
          </Link>
        </Button>
        {(r.status === "confirmed" || r.status === "cancelled" || r.status === "completed") && (
          <Button variant="accent" size="sm" onClick={() => downloadReservationReceipt(r)}>
            <Download className="size-4" /> Reçu PDF
          </Button>
        )}

        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">Annuler</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Annuler cette réservation ?</AlertDialogTitle>
                <AlertDialogDescription>
                  L'annulation est gratuite jusqu'à 48h avant le départ. Cette action est définitive.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Retour</AlertDialogCancel>
                <AlertDialogAction onClick={onCancel}>Confirmer l'annulation</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </article>
  );
}
