import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Auth pages and sessions must never be prerendered/shared between requests.
export const dynamic = "force-dynamic";

// Cadre neutre ; chaque page/opération privée vérifie aussi son accès serveur.
export default function TeamLayout({ children }: { children: ReactNode }) {
  return children;
}
