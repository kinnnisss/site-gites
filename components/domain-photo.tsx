"use client";

import Image from "next/image";
import { useState } from "react";
import type { DomainPhoto as Photo } from "@/data/domain";
import { CottageIllustration } from "@/components/cottage-illustration";

/** Même rendu pour les emplacements vides et les futures photographies locales. */
export function DomainPhoto({
  photo,
  hero = false,
  className = "",
  sizes = "(max-width: 767px) 100vw, 50vw",
}: {
  photo: Photo;
  hero?: boolean;
  className?: string;
  sizes?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasPhoto = Boolean(photo.src && photo.alt && failedSrc !== photo.src);

  return (
    <figure className={className}>
      <div
        className={`relative isolate overflow-hidden border border-line bg-paper ${hero ? "aspect-[4/3.5] rounded-t-[45%] rounded-b-2xl" : "aspect-[4/3] rounded-xl"}`}
      >
        {hasPhoto ? (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={sizes}
            preload={hero}
            className="object-cover"
            onError={() => setFailedSrc(photo.src)}
          />
        ) : hero ? (
          <CottageIllustration className="h-full w-full opacity-65" />
        ) : (
          <div className="photo-placeholder flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <svg
              width="38"
              height="38"
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              aria-hidden="true"
              className="text-gold"
            >
              <rect x="3" y="5" width="26" height="22" rx="3" />
              <circle cx="22" cy="12" r="3" />
              <path d="m3 24 8-9 8 9 4-4 6 6" />
            </svg>
            <span className="font-serif text-xl text-foreground">
              {photo.label}
            </span>
            <span className="text-xs text-muted">Photographie à venir</span>
          </div>
        )}
        {!hasPhoto && hero && (
          <span className="absolute inset-x-6 bottom-6 rounded-lg bg-background/95 p-3 text-center text-xs leading-5 text-foreground">
            Photographie du domaine à venir
            <br />
            Illustration d’ambiance, sans représentation du lieu réel
          </span>
        )}
      </div>
      <figcaption className="mt-3 text-xs leading-5 text-muted">
        {hasPhoto
          ? photo.label
          : failedSrc === photo.src && photo.src
            ? `${photo.label} · photographie indisponible`
            : `${photo.label} · en attente des photographies du propriétaire`}
      </figcaption>
    </figure>
  );
}
