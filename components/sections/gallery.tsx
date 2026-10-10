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
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {gallery.map((photo) => (
          <DomainPhoto
            key={photo.id}
            photo={photo}
            variant="gallery"
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
          />
        ))}
      </div>
    </section>
  );
}
