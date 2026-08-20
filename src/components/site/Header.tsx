import { Link } from "@tanstack/react-router";
import { Menu, CarFront, User2, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/vehicules", label: "Nos véhicules" },
  { to: "/comment-ca-marche", label: "Comment ça marche" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { user, isStaff } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container-page flex h-18 items-center justify-between gap-6 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CarFront className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Velora</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
            <Link to="/vehicules">Réserver maintenant</Link>
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Administration">
                  <User2 className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {isStaff && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <LayoutDashboard className="mr-2 size-4" /> Administration
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 size-4" /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-10 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
                {isStaff && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
                  >
                    Administration
                  </Link>
                )}

                <Button asChild variant="accent" className="mt-4">
                  <Link to="/vehicules" onClick={() => setOpen(false)}>
                    Réserver maintenant
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
