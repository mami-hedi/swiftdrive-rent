import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CarFront, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion administration — Velora Rent" },
      { name: "description", content: "Accès réservé à l'équipe Velora Rent pour gérer la flotte et les réservations." },
      { property: "og:title", content: "Connexion administration — Velora Rent" },
      { property: "og:description", content: "Espace de gestion Velora Rent." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/admin", replace: true });
  }, [user, navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Bienvenue !");
    navigate({ to: "/admin" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-primary p-14 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <CarFront className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">Velora Rent</span>
        </div>
        <div>
          <h2 className="text-4xl font-semibold leading-tight">
            Gérez votre flotte,<br />au même endroit.
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/70">
            Réservations, véhicules, planning et statistiques : tout l'outil de gestion Velora Rent.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/50">© {new Date().getFullYear()} Velora Rent</p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold">Administration</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Espace réservé à l'équipe Velora Rent. Aucun compte client n'est nécessaire pour réserver.
          </p>

          <form onSubmit={signIn} className="mt-8 space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase text-muted-foreground">Mot de passe</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />} Se connecter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
