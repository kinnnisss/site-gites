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
      <div className="hero-copy">
        <p className="eyebrow">Votre séjour en Dordogne</p>
        <p className="hero-location">
          <Icon name="pin" />
          {domain.location}
        </p>
        <h1 id="hero-title" className="hero-title">
          {firstWord}
          <br />
          <em>{rest.join(" ")}</em>
        </h1>
        <p className="hero-tagline">{domain.tagline}</p>
        <p className="body-copy hero-description">
          Une maison de {domain.house.area} m² entièrement rénovée, un grand
          jardin et une piscine. Découvrez le domaine et ses espaces pour votre
          prochain séjour en Dordogne.
        </p>
        <div className="hero-actions">
          <a href="#contact" className="button-primary">
            Nous contacter <Icon name="arrow" />
          </a>
          <a href="#domaine" className="button-secondary">
            Découvrir le domaine <span aria-hidden="true">↓</span>
          </a>
        </div>
        <ul className="hero-features" aria-label="Les espaces du domaine">
          <li><Icon name="bed" />{domain.house.bedrooms} chambres</li>
          <li><Icon name="leaf" />Jardin</li>
          <li><Icon name="water" />Piscine</li>
        </ul>
      </div>
      <DomainPhoto
        photo={photos.hero}
        variant="hero"
        sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1199px) 42vw, 500px"
      />
    </section>
  );
}
