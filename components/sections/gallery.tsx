import { gallery } from "@/data/domain";
import { DomainPhoto } from "@/components/domain-photo";
import { SectionHeading } from "@/components/section-heading";

export function Gallery() {
  const availablePhotos = gallery.filter((photo) => photo.src && photo.alt);
  const waitingForPhotos = availablePhotos.length === 0;
  const displayedPhotos = waitingForPhotos ? gallery : availablePhotos;
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
          : "Découvrez le domaine au fil des photographies partagées par le propriétaire."}
      </p>
      <div className={`gallery-grid ${waitingForPhotos ? "" : "has-photos"}`}>
        {displayedPhotos.map((photo) => (
          <DomainPhoto
            key={photo.id}
            photo={photo}
            variant="gallery"
            sizes={waitingForPhotos
              ? "(max-width: 767px) calc((100vw - 56px) / 2), (max-width: 1199px) calc((100vw - 88px) / 4), 275px"
              : "(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc((100vw - 56px) / 2), (max-width: 1199px) calc((100vw - 72px) / 3), 376px"}
          />
        ))}
      </div>
    </section>
  );
}
