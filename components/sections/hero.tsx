import { domain, photos } from "@/data/domain";
import { DomainPhoto } from "@/components/domain-photo";
import { Icon } from "@/components/icon";

export function Hero() {
  const [firstWord, ...rest] = domain.name.split(" ");
  return (
    <section
      id="accueil"
      tabIndex={-1}
      aria-labelledby="hero-title"
      className="site-width hero-layout"
    >
      <div>
        <p className="eyebrow hero-location">
          <Icon name="pin" />
          {domain.location}
        </p>
        <h1 id="hero-title" className="hero-title">
          {firstWord}
          <br />
          <em>{rest.join(" ")}</em>
        </h1>
        <p className="hero-tagline">{domain.tagline}</p>
        <p className="body-copy mt-6 max-w-lg">
          Une maison de {domain.house.area} m² entièrement rénovée, un grand
          jardin et une piscine. Découvrez le domaine et ses espaces pour votre
          prochain séjour en Dordogne.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#domaine" className="button-primary">
            Découvrir le domaine <span aria-hidden="true">↓</span>
          </a>
          <a href="#contact" className="button-secondary">
            Nous contacter <span aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="hero-note">
          <Icon name="leaf" />
          Une maison, un jardin, le temps d’une parenthèse.
        </p>
      </div>
      <DomainPhoto
        photo={photos.hero}
        variant="hero"
        sizes="(max-width: 767px) 100vw, 40vw"
      />
    </section>
  );
}
