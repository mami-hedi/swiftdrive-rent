import { Link } from "@tanstack/react-router";
import { CarFront, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <CarFront className="size-5" />
            </span>
            <span className="font-display text-lg font-semibold">Velora Rent</span>
          </div>
          <p className="text-sm text-primary-foreground/70">
            Location de véhicules récents partout en France. Tarifs transparents, réservation en 2 minutes.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">Navigation</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/vehicules" className="hover:text-accent">Nos véhicules</Link></li>
            <li><Link to="/comment-ca-marche" className="hover:text-accent">Comment ça marche</Link></li>
            <li><Link to="/a-propos" className="hover:text-accent">À propos</Link></li>
            <li><Link to="/faq" className="hover:text-accent">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">Informations</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
            <li><Link to="/terms" className="hover:text-accent">Conditions générales</Link></li>
            <li><Link to="/privacy" className="hover:text-accent">Confidentialité</Link></li>
            <li><Link to="/auth" className="hover:text-accent">Espace administration</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">Contact</h3>
          <ul className="space-y-3 text-sm text-primary-foreground/70">
            <li className="flex items-start gap-2"><Phone className="mt-0.5 size-4 text-accent" /> +33 1 84 60 22 10</li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 size-4 text-accent" /> contact@velora-rent.fr</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 text-accent" /> 18 Avenue des Champs, 75008 Paris</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-6 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} Velora Rent. Tous droits réservés.
      </div>
    </footer>
  );
}
