import { domain, photos } from "@/data/domain";
import { DomainPhoto } from "@/components/domain-photo";
import { FeatureList, SectionHeading } from "@/components/section-heading";
import { Icon, type IconName } from "@/components/icon";

export function House() {
  const icons: IconName[] = ["home", "kitchen", "bed", "bath"];
  return (
    <section
      id="maison"
      tabIndex={-1}
      aria-labelledby="maison-title"
      className="site-width section-space editorial-grid"
    >
      <DomainPhoto photo={photos.house} />
      <div>
        <SectionHeading id="maison-title" eyebrow="Agencement & volumes">
          Une maison de {domain.house.area} m² entièrement rénovée
        </SectionHeading>
        <p className="body-copy mt-5">
          Une grande pièce de vie, une cuisine entièrement équipée et{" "}
          {domain.house.bedrooms} chambres composent les espaces de la maison.
        </p>
        <div className="mt-6 space-y-3">
          {domain.houseDetails.map((item, index) => (
            <div key={item.title} className="detail-row">
              <Icon name={icons[index]} className="text-gold" />
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="detail-description">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
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
      className="section-space bg-paper"
    >
      <div className="site-width">
        <SectionHeading
          id="equipements-title"
          eyebrow="Confort & quotidien"
          centered
        >
          Des équipements pensés
          <br className="hidden sm:block" /> pour votre séjour
        </SectionHeading>
        <p className="section-intro">
          De la cuisine aux équipements de confort, retrouvez l’essentiel de la
          maison.
        </p>
        <div className="amenities-grid">
          {domain.amenities.map((group, index) => (
            <article key={group.title} className="editorial-card amenity-card">
              <div className="card-heading">
                <span className="icon-tile">
                  <Icon name={index === 0 ? "kitchen" : "sun"} />
                </span>
                <h3 className="card-title">{group.title}</h3>
              </div>
              <p className="body-copy mt-4">
                {group.description}
              </p>
              <FeatureList items={group.items} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
