import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du Domaine Lo Carmahon, à compléter avant publication.",
  openGraph: {
    title: "Mentions légales",
    description: "Informations légales en cours de préparation.",
  },
};

export default function Page() {
  return <LegalPage kind="legal" />;
}
