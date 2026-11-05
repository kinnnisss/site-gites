import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Aucun accès aux dossiers : les pages attendent les contrôles serveur de phase 2.
export default function TeamLayout({ children }: { children: ReactNode }) {
  return children;
}
