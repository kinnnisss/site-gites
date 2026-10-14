"use client";

import Image from "next/image";
import { useState } from "react";
import type { DomainPhoto as Photo } from "@/data/domain";
import { Icon } from "@/components/icon";

export function DomainPhoto({
  photo,
  variant = "editorial",
  className = "",
  sizes = "(max-width: 767px) calc(100vw - 40px), (max-width: 1199px) 45vw, 550px",
}: {
  photo: Photo;
  variant?: "hero" | "editorial" | "landscape" | "gallery";
  className?: string;
  sizes?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const hasPhoto = Boolean(photo.src && photo.alt && failedSrc !== photo.src);
  const failed = Boolean(photo.src && failedSrc === photo.src);
  const loading = hasPhoto && loadedSrc !== photo.src;
  return (
    <figure
      className={`domain-photo media-${variant} ${hasPhoto ? "has-photo" : "is-placeholder"} ${className}`}
    >
      <div className="media-frame" aria-busy={loading}>
        {hasPhoto && (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={sizes}
            preload={variant === "hero"}
            className="object-cover"
            onLoad={() => setLoadedSrc(photo.src)}
            onError={() => setFailedSrc(photo.src)}
          />
        )}
        {(!hasPhoto || loading) && (
          <div className="media-empty">
            <span className="media-empty-icon">
              <Icon name="camera" />
            </span>
            <p className="media-status">
              {loading
                ? "Chargement de la photographie…"
                : failed
                  ? "Photographie indisponible"
                  : "Photographie à venir"}
            </p>
          </div>
        )}
      </div>
      <figcaption className="media-caption">
        <p className="media-label">{photo.label}</p>
        {!hasPhoto && variant !== "gallery" && (
          <p className="media-note">
            {failed
              ? "Cette photographie n’a pas pu être chargée."
              : "En attente des photographies du propriétaire."}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
