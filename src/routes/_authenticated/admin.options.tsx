import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { fetchOptions } from "@/services/api";
import { eur } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/admin/options")({
  component: AdminOptions,
});

function AdminOptions() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["options"], queryFn: fetchOptions });
  const [name, setName] = useState("");
  const [price, setPrice] = useState("5");
  const [description, setDescription] = useState("");

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["options"] });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("rental_options")
        .insert({ name, price_per_day: Number(price), description });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Option ajoutée.");
      setName("");
      setDescription("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase.from("rental_options").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rental_options").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Option supprimée.");
      refresh();
    },
    onError: () => toast.error("Suppression impossible."),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Options de location</h1>
        <p className="mt-2 text-sm text-muted-foreground">Gérez les suppléments proposés lors de la réservation.</p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[1fr_140px_1fr_auto] sm:items-end">
        <div>
          <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Nom</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Rehausseur" />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Prix / jour</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <Button variant="accent" disabled={!name || add.isPending} onClick={() => add.mutate()}>
          <Plus className="size-4" /> Ajouter
        </Button>
      </div>

      <div className="space-y-3">
        {(data ?? []).map((o) => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
            <div>
              <p className="font-semibold">{o.name}</p>
              <p className="text-sm text-muted-foreground">{o.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                defaultValue={Number(o.price_per_day)}
                className="w-24"
                onBlur={(e) => update.mutate({ id: o.id, patch: { price_per_day: Number(e.target.value) } })}
              />
              <span className="text-sm text-muted-foreground">{eur(Number(o.price_per_day))}/jour</span>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={o.active} onCheckedChange={(c) => update.mutate({ id: o.id, patch: { active: c } })} />
                Active
              </label>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(o.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
