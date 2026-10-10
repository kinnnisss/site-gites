"use client";

import Image from "next/image";
import { useState } from "react";
import type { DomainPhoto as Photo } from "@/data/domain";
import { CottageIllustration } from "@/components/cottage-illustration";
import { Icon } from "@/components/icon";

export function DomainPhoto({
  photo,
  variant = "editorial",
  className = "",
  sizes = "(max-width: 767px) 100vw, 50vw",
}: {
  photo: Photo;
  variant?: "hero" | "editorial" | "landscape" | "gallery";
  className?: string;
  sizes?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasPhoto = Boolean(photo.src && photo.alt && failedSrc !== photo.src);
  const failed = Boolean(photo.src && failedSrc === photo.src);
  return (
    <figure
      className={`domain-photo media-${variant} ${hasPhoto ? "has-photo" : "is-placeholder"} ${className}`}
    >
      {hasPhoto ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          preload={variant === "hero"}
          className="object-cover"
          onError={() => setFailedSrc(photo.src)}
        />
      ) : variant === "hero" ? (
        <CottageIllustration className="absolute inset-0 h-full w-full opacity-75" />
      ) : (
        <div className="media-empty" aria-hidden="true">
          <span className="media-empty-ring">
            <Icon name="camera" />
          </span>
        </div>
      )}
      <div className="media-shade" />
      {!hasPhoto && variant !== "hero" && (
        <span className="media-badge">
          {failed ? "Photo indisponible" : "Photographie à venir"}
        </span>
      )}
      <figcaption className="media-caption">
        <p className="media-label">
          {variant === "hero" ? "Une première esquisse" : photo.label}
        </p>
        {!hasPhoto && (
          <p className="media-note">
            {variant === "hero"
              ? "Illustration d’ambiance · ne représente pas le domaine"
              : failed
                ? "Cette photographie n’a pas pu être chargée."
                : "En attente des photographies du propriétaire"}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
