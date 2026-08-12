import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="container-page py-14 md:py-20">
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        )}
        <h1 className="max-w-3xl text-3xl font-semibold md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
