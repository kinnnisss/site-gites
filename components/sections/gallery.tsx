import { gallery } from "@/data/domain";
import { DomainPhoto } from "@/components/domain-photo";
import { SectionHeading } from "@/components/section-heading";

export function Gallery() {
  const waitingForPhotos = !gallery.some((photo) => photo.src && photo.alt);
  return (
    <section
      id="galerie"
      tabIndex={-1}
      aria-labelledby="galerie-title"
      className="site-width section-space"
    >
      <SectionHeading
        id="galerie-title"
        eyebrow="Regards sur le domaine"
        centered
      >
        Galerie photographique
      </SectionHeading>
      <p className="section-intro">
        {waitingForPhotos
          ? "Les photographies du domaine seront bientôt disponibles. En attendant, découvrez les espaces qui seront présentés ici."
          : "Découvrez les espaces de la maison et les extérieurs du domaine en images."}
      </p>
      <div className="gallery-grid">
        {gallery.map((photo) => (
          <DomainPhoto
            key={photo.id}
            photo={photo}
            variant="gallery"
            sizes="(max-width: 767px) calc((100vw - 56px) / 2), (max-width: 1199px) calc((100vw - 88px) / 4), 275px"
          />
        ))}
      </div>
    </section>
  );
}
