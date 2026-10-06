import { domain, photos } from "@/data/domain";
import { DomainPhoto } from "@/components/domain-photo";
import { FeatureList, SectionHeading } from "@/components/section-heading";

export function House() {
  return (
    <section
      id="maison"
      tabIndex={-1}
      aria-labelledby="maison-title"
      className="site-width section-space grid items-center gap-10 md:grid-cols-2 md:gap-16"
    >
      <DomainPhoto photo={photos.house} />
      <div>
        <SectionHeading id="maison-title" eyebrow="La maison">
          Un intérieur pensé pour le quotidien
        </SectionHeading>
        <p className="mt-6 leading-8 text-muted">
          Entièrement rénovée, la maison de {domain.house.area} m² réunit une
          grande pièce de vie, une cuisine équipée et des espaces de repos
          répartis en {domain.house.bedrooms} chambres.
        </p>
        <FeatureList items={domain.houseFeatures} />
        <a
          href="#galerie"
          className="mt-7 inline-flex min-h-11 items-center gap-4 text-sm text-accent underline underline-offset-4"
        >
          La maison en images <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}

export function Amenities() {
  return (
    <section
      id="equipements"
      tabIndex={-1}
      aria-labelledby="equipements-title"
      className="site-width pb-16 md:pb-20"
    >
      <SectionHeading id="equipements-title" eyebrow="Les équipements">
        Le confort, simplement.
      </SectionHeading>
      <div className="mt-9 grid gap-6 md:grid-cols-2">
        {domain.amenities.map((group, index) => (
          <article
            key={group.title}
            className="rounded-xl border border-line bg-paper p-7 md:p-9"
          >
            <p className="eyebrow">0{index + 1}</p>
            <h3 className="mt-3 font-serif text-2xl">{group.title}</h3>
            <FeatureList items={group.items} />
          </article>
        ))}
      </div>
    </section>
  );
}
