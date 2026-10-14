import Link from "next/link";
import { domain } from "@/data/domain";

const content = {
  legal: {
    title: "Mentions légales",
    intro:
      "Les mentions légales sont en cours de préparation. Les informations ci-dessous doivent être complétées et validées par le propriétaire avant la publication du site.",
    missing: [
      "Identité et statut de l’éditeur du site",
      "Coordonnées de l’éditeur et identifiants applicables",
      "Responsable de la publication",
      "Identité et coordonnées de l’hébergeur",
      "Crédits et droits d’utilisation des photographies",
    ],
  },
  privacy: {
    title: "Politique de confidentialité",
    intro:
      "La politique de confidentialité reste à compléter et à valider avant la publication du site. Cette page ne constitue pas une politique définitive.",
    missing: [
      "Identité et coordonnées du responsable du traitement",
      "Traitements liés aux prises de contact et à l’hébergement du site",
      "Finalités, bases légales, destinataires et durées de conservation",
      "Modalités d’exercice des droits et point de contact",
      "Informations sur les éventuels cookies et services tiers lors de la publication",
    ],
  },
} as const;

export function LegalPage({ kind }: { kind: keyof typeof content }) {
  const page = content[kind];
  return (
    <div className="site-width section-space">
      <div className="max-w-3xl">
        <p className="eyebrow">{domain.name}</p>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl">{page.title}</h1>
        <p className="mt-7 rounded-xl border border-line bg-paper p-6 leading-8 text-muted">
          {page.intro}
        </p>
        <h2 className="mt-10 font-serif text-2xl">Informations à compléter</h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-muted">
          {page.missing.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link href="/" className="button-secondary mt-9">
          Retour au domaine
        </Link>
      </div>
    </div>
  );
}
