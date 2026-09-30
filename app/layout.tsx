import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Parenthèse — Démonstration de gîtes fictifs",
  description: "Maquette d’un site de location de gîtes. Hébergements et identité fictifs, aucune réservation possible.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
