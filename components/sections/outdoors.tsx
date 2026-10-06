import { domain, photos } from "@/data/domain";
import { DomainPhoto } from "@/components/domain-photo";
import { FeatureList, SectionHeading } from "@/components/section-heading";

export function Outdoors() {
  return (
    <section
      id="exterieurs"
      tabIndex={-1}
      aria-labelledby="exterieurs-title"
      className="section-space border-y border-line bg-paper"
    >
      <div className="site-width">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading id="exterieurs-title" eyebrow="Les extérieurs">
            Faire place au grand air.
          </SectionHeading>
          <p className="max-w-sm text-sm leading-7 text-muted">
            Du jardin à la piscine, de la terrasse aux terrains de jeux : les
            espaces extérieurs prolongent la maison.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <DomainPhoto photo={photos.garden} />
          <DomainPhoto photo={photos.pool} />
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {domain.outdoors.map((group) => (
            <article key={group.title} className="border-t border-line pt-6">
              <h3 className="font-serif text-2xl">{group.title}</h3>
              <FeatureList items={group.items} />
            </article>
          ))}
        </div>
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
      className="site-width section-space grid items-center gap-10 md:grid-cols-2 md:gap-16"
    >
      <div>
        <SectionHeading id="equestre-title" eyebrow="L’espace équestre">
          Les installations du domaine
        </SectionHeading>
        <p className="mt-6 leading-8 text-muted">
          Le domaine dispose également d’un espace équestre, avec les
          installations suivantes.
        </p>
        <FeatureList items={domain.equestrian} />
        <p className="mt-6 border-l-2 border-gold pl-4 text-sm leading-7 text-muted">
          Les modalités d’utilisation et l’accueil éventuel de chevaux restent à
          préciser par le propriétaire.
        </p>
      </div>
      <DomainPhoto photo={photos.equestrian} />
    </section>
  );
}
