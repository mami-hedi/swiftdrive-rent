import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { fetchVehicles } from "@/services/api";
import { CATEGORIES, FUELS, TRANSMISSIONS, VEHICLE_STATUS_LABELS, eur, type Vehicle } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/admin/vehicules")({
  component: AdminVehicles,
});

const EMPTY = {
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  category: "Berline",
  transmission: "Automatique",
  fuel: "Essence",
  seats: 5,
  doors: 5,
  luggage: 2,
  mileage: 0,
  daily_price: 60,
  weekly_price: 360,
  monthly_price: 1200,
  description: "",
  features: "",
  images: "",
  status: "available",
};

function AdminVehicles() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["vehicles"], queryFn: fetchVehicles });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        features: String(form['features'] ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        images: String(form['images'] ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      };
      const { error } = editing
        ? await supabase.from("vehicles").update(payload).eq("id", editing)
        : await supabase.from("vehicles").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editing ? "Véhicule modifié." : "Véhicule ajouté.");
      setOpen(false);
      setEditing(null);
      setForm(EMPTY);
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Véhicule supprimé.");
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: () => toast.error("Suppression impossible : ce véhicule a des réservations."),
  });

  function edit(v: Vehicle) {
    setEditing(v.id);
    setForm({ ...v, features: v.features.join(", "), images: v.images.join(", ") });
    setOpen(true);
  }

  const selectClass = "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm";
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Véhicules</h1>
          <p className="mt-2 text-sm text-muted-foreground">{data?.length ?? 0} véhicule(s) en flotte</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(EMPTY); } }}>
          <DialogTrigger asChild>
            <Button variant="accent"><Plus className="size-4" /> Ajouter un véhicule</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier le véhicule" : "Nouveau véhicule"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              {([
                ["brand", "Marque", "text"],
                ["model", "Modèle", "text"],
                ["year", "Année", "number"],
                ["mileage", "Kilométrage", "number"],
                ["daily_price", "Prix / jour", "number"],
                ["weekly_price", "Prix / semaine", "number"],
                ["monthly_price", "Prix / mois", "number"],
                ["seats", "Places", "number"],
                ["doors", "Portes", "number"],
                ["luggage", "Bagages", "number"],
              ] as const).map(([k, label, type]) => (
                <div key={k}>
                  <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">{label}</Label>
                  <Input
                    type={type}
                    value={String(form[k] ?? "")}
                    onChange={(e) => set(k, type === "number" ? Number(e.target.value) : e.target.value)}
                  />
                </div>
              ))}
              <div>
                <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Catégorie</Label>
                <select className={selectClass} value={String(form['category'])} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Transmission</Label>
                <select className={selectClass} value={String(form['transmission'])} onChange={(e) => set("transmission", e.target.value)}>
                  {TRANSMISSIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Carburant</Label>
                <select className={selectClass} value={String(form['fuel'])} onChange={(e) => set("fuel", e.target.value)}>
                  {FUELS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Statut</Label>
                <select className={selectClass} value={String(form['status'])} onChange={(e) => set("status", e.target.value)}>
                  {Object.entries(VEHICLE_STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Équipements (séparés par des virgules)</Label>
                <Input value={String(form['features'] ?? "")} onChange={(e) => set("features", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Images (URLs séparées par des virgules)</Label>
                <Input value={String(form['images'] ?? "")} onChange={(e) => set("images", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Description</Label>
                <Textarea rows={4} value={String(form['description'] ?? "")} onChange={(e) => set("description", e.target.value)} />
              </div>
            </div>
            <Button variant="accent" className="mt-4" disabled={save.isPending} onClick={() => save.mutate()}>
              Enregistrer
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(data ?? []).map((v) => (
          <div key={v.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <img
              src={v.images?.[0] ?? "/images/cars/bmw-3.jpg"}
              alt={`${v.brand} ${v.model}`}
              loading="lazy"
              width={1200}
              height={800}
              className="aspect-[3/2] w-full object-cover"
            />
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">{v.brand} {v.model}</h2>
                <Badge variant={v.status === "available" ? "success" : "muted"}>{VEHICLE_STATUS_LABELS[v.status]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{v.year} · {v.category} · {eur(Number(v.daily_price))}/jour</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => edit(v)}><Pencil className="size-4" /> Modifier</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost"><Trash2 className="size-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce véhicule ?</AlertDialogTitle>
                      <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove.mutate(v.id)}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
