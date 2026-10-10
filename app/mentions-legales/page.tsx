import type { Metadata } from "next";
import { LegalNotice } from "@/components/legal-notice";

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
  return <LegalNotice />;
}
