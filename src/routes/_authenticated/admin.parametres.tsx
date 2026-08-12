import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/services/api";

export const Route = createFileRoute("/_authenticated/admin/parametres")({
  component: AdminSettings,
});

const FIELDS = [
  ["company_name", "Nom de l'entreprise"],
  ["logo_url", "URL du logo"],
  ["phone", "Téléphone"],
  ["email", "Email"],
  ["address", "Adresse"],
  ["currency", "Devise"],
  ["vat_rate", "TVA (%)"],
  ["opening_hours", "Horaires"],
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["linkedin", "LinkedIn"],
] as const;

function AdminSettings() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      const next: Record<string, string> = {};
      for (const [k] of FIELDS) next[k] = String((data as Record<string, unknown>)[k] ?? "");
      next['terms'] = String((data as Record<string, unknown>)['terms'] ?? "");
      setForm(next);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("settings")
        .update({ ...form, vat_rate: Number(form['vat_rate'] ?? 20) })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Paramètres enregistrés.");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Paramètres</h1>
        <p className="mt-2 text-sm text-muted-foreground">Informations de l'entreprise affichées sur le site.</p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        {FIELDS.map(([k, label]) => (
          <div key={k}>
            <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">{label}</Label>
            <Input value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          </div>
        ))}
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Conditions de location</Label>
          <Textarea rows={5} value={form['terms'] ?? ""} onChange={(e) => setForm({ ...form, terms: e.target.value })} />
        </div>
        <Button variant="accent" className="sm:col-span-2" disabled={save.isPending} onClick={() => save.mutate()}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
