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
      className="border-y border-line bg-paper section-space"
    >
      <div className="site-width">
        <SectionHeading id="galerie-title" eyebrow="La galerie">
          Le domaine en images
        </SectionHeading>
        {waitingForPhotos && (
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">
            Les photographies du domaine seront bientôt disponibles. Ces
            emplacements présentent les espaces à découvrir ; ils ne contiennent
            aucune photographie de substitution.
          </p>
        )}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {gallery.map((photo) => (
            <DomainPhoto
              key={photo.id}
              photo={photo}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
