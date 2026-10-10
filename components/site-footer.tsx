import Link from "next/link";
import { domain, navigation } from "@/data/domain";
import { Brand } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-width">
        <div className="footer-grid">
          <div>
            <Brand />
            <p className="mt-6 max-w-xs text-sm leading-7 text-muted">
              Une maison entièrement rénovée, un jardin et une piscine pour une
              parenthèse en Dordogne.
            </p>
            <p className="mt-4 font-serif text-lg italic text-gold">
              {domain.tagline}
            </p>
          </div>
          <nav aria-label="Découvrir le domaine">
            <p className="eyebrow mb-4">Découvrir le domaine</p>
            {navigation
              .filter((link) =>
                [
                  "domaine",
                  "maison",
                  "equipements",
                  "exterieurs",
                  "galerie",
                ].includes(link.id),
              )
              .map((link) => (
                <Link
                  className="footer-link"
                  key={link.id}
                  href={`/#${link.id}`}
                >
                  {link.label}
                </Link>
              ))}
          </nav>
          <nav aria-label="Informations et liens légaux">
            <p className="eyebrow mb-4">Informations</p>
            <Link className="footer-link" href="/#informations">
              Informations pratiques
            </Link>
            <Link className="footer-link" href="/#contact">
              Nous contacter
            </Link>
            <Link className="footer-link" href="/mentions-legales">
              Mentions légales
            </Link>
            <Link className="footer-link" href="/confidentialite">
              Politique de confidentialité
            </Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            {domain.name} · {domain.location}
          </span>
          <Link
            href="/#accueil"
            className="inline-flex min-h-11 items-center gap-3 hover:text-accent"
          >
            Retour en haut <span aria-hidden="true">↑</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
