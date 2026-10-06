import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité du Domaine Lo Carmahon, à compléter avant publication.",
  openGraph: {
    title: "Politique de confidentialité",
    description: "Politique de confidentialité en cours de préparation.",
  },
};

export default function Page() {
  return <LegalPage kind="privacy" />;
}
