import Link from "next/link";
import { domain } from "@/data/domain";

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-9">
      <div className="site-width flex flex-col justify-between gap-7 md:flex-row md:items-center">
        <div>
          <p className="font-serif text-2xl">{domain.name}</p>
          <p className="mt-2 text-xs leading-6 text-muted">{domain.location}</p>
        </div>
        <nav
          aria-label="Navigation de pied de page"
          className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted"
        >
          <Link
            href="/mentions-legales"
            className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
          >
            Mentions légales
          </Link>
          <Link
            href="/confidentialite"
            className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
          >
            Politique de confidentialité
          </Link>
          <Link
            href="/#accueil"
            className="inline-flex min-h-11 items-center text-accent underline-offset-4 hover:underline"
          >
            Retour à l’accueil ↑
          </Link>
        </nav>
      </div>
    </footer>
  );
}
