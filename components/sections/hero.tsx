import { domain, photos } from "@/data/domain";
import { DomainPhoto } from "@/components/domain-photo";

export function Hero() {
  return (
    <section
      id="accueil"
      tabIndex={-1}
      aria-labelledby="hero-title"
      className="site-width grid items-center gap-10 py-12 md:grid-cols-2 md:gap-14 md:py-20"
    >
      <div>
        <p className="eyebrow">{domain.location}</p>
        <h1
          id="hero-title"
          className="mt-6 font-serif text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
        >
          {domain.name}
        </h1>
        <p className="mt-7 max-w-md font-serif text-2xl leading-relaxed text-foreground">
          {domain.tagline}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#domaine" className="button-primary">
            Découvrir le domaine <span aria-hidden="true">↗</span>
          </a>
          <a href="#contact" className="button-secondary">
            Nous contacter
          </a>
        </div>
      </div>
      <DomainPhoto photo={photos.hero} hero />
    </section>
  );
}
