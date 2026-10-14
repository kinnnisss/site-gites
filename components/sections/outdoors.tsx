import { domain, photos } from "@/data/domain";
import { DomainPhoto } from "@/components/domain-photo";
import { FeatureList, SectionHeading } from "@/components/section-heading";
import { Icon, type IconName } from "@/components/icon";

export function Outdoors() {
  const icons: IconName[] = ["leaf", "kitchen", "sun"];
  return (
    <section
      id="exterieurs"
      tabIndex={-1}
      aria-labelledby="exterieurs-title"
      className="site-width section-space"
    >
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <SectionHeading id="exterieurs-title" eyebrow="Vivre au dehors">
            Un jardin de {domain.gardenArea.toLocaleString("fr-FR")} m²,
            <br className="hidden sm:block" /> au rythme des vacances
          </SectionHeading>
          <p className="body-copy mt-5">
            Profiter d’un repas sur la terrasse, se retrouver autour de la
            piscine ou partager un moment de loisirs : les extérieurs prolongent
            la maison.
          </p>
        </div>
        <a href="#galerie" className="button-secondary shrink-0">
          <Icon name="camera" />
          Découvrir les espaces
        </a>
      </div>
      <div className="outdoor-media">
        <DomainPhoto photo={photos.garden} variant="landscape" />
        <DomainPhoto photo={photos.pool} variant="landscape" />
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {domain.outdoors.map((group, index) => (
          <article key={group.title} className="outdoor-card">
            <Icon name={icons[index]} className="mb-5 text-gold" />
            <h3 className="font-serif text-[27px]">{group.title}</h3>
            <FeatureList items={group.items} />
          </article>
        ))}
      </div>
    </section>
  );
}

export function Equestrian() {
  return (
    <section
      id="equestre"
      tabIndex={-1}
      aria-labelledby="equestre-title"
      className="section-space bg-paper"
    >
      <div className="site-width editorial-grid">
        <div>
          <SectionHeading id="equestre-title" eyebrow="L’espace équestre">
            Installations équestres
            <br />
            du domaine
          </SectionHeading>
          <p className="body-copy mt-5">
            Le domaine dispose d’un espace équestre comprenant une écurie, des
            boxes et des espaces extérieurs.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {domain.equestrian.map((item) => (
              <li key={item} className="equestrian-item">
                <Icon name="home" className="text-gold" />
                {item}
              </li>
            ))}
          </ul>
          <p className="notice mt-6">
            <Icon name="shield" />
            <span>
              Les modalités d’utilisation et l’accueil éventuel de chevaux
              restent à préciser par le propriétaire.
            </span>
          </p>
        </div>
        <DomainPhoto photo={photos.equestrian} />
      </div>
    </section>
  );
}
