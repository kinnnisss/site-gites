import type { ReactNode } from "react";
import Link from "next/link";
import { domain, addressText } from "@/data/domain";
import { legalDetails } from "@/data/legal";
import { Icon } from "@/components/icon";
import styles from "./legal-notice.module.css";

type LegalSection = {
  number: string;
  title: string;
  label: string;
};

const sections = [
  { number: "01", title: "Éditeur du site", label: "Identité & publication" },
  { number: "02", title: "Hébergement", label: "Prestataire du site" },
  {
    number: "03",
    title: "Propriété intellectuelle",
    label: "Contenus & identité",
  },
  {
    number: "04",
    title: "Photographies & crédits",
    label: "Visuels & typographies",
  },
  {
    number: "05",
    title: "Données personnelles & contact",
    label: "Vie privée",
  },
] as const satisfies readonly LegalSection[];

function LegalCard({
  section,
  children,
}: {
  section: LegalSection;
  children: ReactNode;
}) {
  const { number, title, label } = section;
  return (
    <section
      id={`legal-${number}`}
      tabIndex={-1}
      aria-labelledby={`legal-title-${number}`}
      className={styles.card}
    >
      <div className={styles.cardHeading}>
        <span className={styles.number} aria-hidden="true">
          {number}
        </span>
        <div>
          <p className={styles.category}>{label}</p>
          <h2 id={`legal-title-${number}`}>{title}</h2>
        </div>
      </div>
      <div className={styles.copy}>{children}</div>
    </section>
  );
}

function Details({
  rows,
}: {
  rows: readonly { label: string; value: string }[];
}) {
  return (
    <dl className={styles.details}>
      {rows.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>
            {value.trim() || (
              <span className={styles.pending}>À renseigner</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function LegalNotice() {
  return (
    <div
      id="mentions-legales"
      tabIndex={-1}
      className={`site-width ${styles.page}`}
    >
      <nav aria-label="Fil d’Ariane" className={styles.breadcrumb}>
        <ol>
          <li>
            <Link href="/">Accueil</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page">Mentions légales</span>
          </li>
        </ol>
      </nav>
      <header className={styles.intro}>
        <p className="eyebrow">Informations du site</p>
        <h1>Mentions légales</h1>
        <p className={styles.subtitle}>
          Les informations relatives au {domain.name} et à la publication de ce
          site.
        </p>
        <div
          className={styles.draft}
          role="note"
          aria-labelledby="legal-draft-title"
        >
          <Icon name="shield" />
          <div>
            <p id="legal-draft-title" className={styles.draftTitle}>
              Version à compléter
            </p>
            <p>
              Ces mentions sont en cours de préparation. Les informations
              manquantes doivent être complétées et l’ensemble validé par le
              propriétaire avant publication.
            </p>
          </div>
        </div>
      </header>
      <div className={styles.layout}>
        <nav aria-labelledby="legal-contents-title" className={styles.contents}>
          <p id="legal-contents-title" className={styles.contentsTitle}>
            Dans cette page
          </p>
          <ol>
            {sections.map((section) => (
              <li key={section.number}>
                <a href={`#legal-${section.number}`}>
                  <span className={styles.contentsNumber} aria-hidden="true">
                    {section.number}
                  </span>
                  <span>{section.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className={styles.cards}>
          <LegalCard section={sections[0]}>
            <p>
              Ce site présente le {domain.name}. L’identité légale de son éditeur
              et le responsable de sa publication restent à confirmer.
            </p>
            <Details
              rows={[
                { label: "Domaine présenté", value: domain.name },
                { label: "Adresse du domaine", value: addressText },
                { label: "Éditeur légal", value: legalDetails.publisher },
                {
                  label: "Statut de l’éditeur",
                  value: legalDetails.publisherStatus,
                },
                { label: "Identifiants", value: legalDetails.publisherIdentifiers },
                {
                  label: "Direction de publication",
                  value: legalDetails.publicationDirector,
                },
                { label: "Contact", value: domain.contact.email },
              ]}
            />
            <p className={styles.small}>
              L’adresse indiquée est celle du domaine. Elle ne préjuge pas de
              l’adresse du siège de l’entité éditrice, qui reste à confirmer.
            </p>
          </LegalCard>
          <LegalCard section={sections[1]}>
            <p>
              Les informations du prestataire qui hébergera la version publiée du
              site seront précisées ici après confirmation.
            </p>
            <Details
              rows={[
                { label: "Hébergeur", value: legalDetails.hostingName },
                { label: "Adresse", value: legalDetails.hostingAddress },
                { label: "Contact", value: legalDetails.hostingContact },
              ]}
            />
            <p className={styles.small}>
              L’identité, les coordonnées et les informations applicables à
              l’hébergement restent à renseigner avant la mise en ligne.
            </p>
          </LegalCard>
          <LegalCard section={sections[2]}>
            <p>
              Cette rubrique est destinée à préciser les droits et les conditions
              d’utilisation des textes, du logo et des autres éléments présents
              sur le site.
            </p>
            <div className={styles.inset}>
              <p className={styles.insetTitle}>
                <Icon name="shield" />
                Blason & identité du domaine
              </p>
              <p>
                Le logo officiel du {domain.name} est utilisé pour identifier le
                lieu. Les titulaires des droits et les conditions d’utilisation
                devront être confirmés par le propriétaire.
              </p>
            </div>
            <p>
              Les mentions relatives à la reproduction et à l’utilisation des
              contenus restent à compléter et à valider.
            </p>
          </LegalCard>
          <LegalCard section={sections[3]}>
            <p>
              Les photographies définitives du domaine ne sont pas encore
              disponibles. Les emplacements prévus pour les accueillir sont
              identifiés sur le site.
            </p>
            <ul className={styles.list}>
              <li>
                <strong>Photographies du domaine :</strong> les auteurs, crédits
                et autorisations d’utilisation seront précisés lors de leur
                intégration.
              </li>
              <li>
                <strong>Emplacements photo :</strong> les cadres portant la
                mention « Photographie à venir » sont des emplacements
                temporaires, en attendant les photographies réelles du
                propriétaire.
              </li>
              <li>
                <strong>Typographies :</strong> Newsreader et Inter sont utilisées
                sous licence SIL Open Font License.
              </li>
            </ul>
            <p className={styles.italic}>
              Les crédits et conditions d’utilisation des visuels devront être
              validés avant publication.
            </p>
          </LegalCard>
          <LegalCard section={sections[4]}>
            <p>
              Le site vitrine actuel ne propose ni compte utilisateur, ni
              formulaire d’envoi, ni réservation ou paiement en ligne.
            </p>
            <p>
              Les informations relatives aux éventuelles prises de contact, à
              l’hébergement et au traitement des données restent à préciser dans
              la politique de confidentialité.
            </p>
            <nav
              className={styles.related}
              aria-label="Confidentialité et contact"
            >
              <Link href="/confidentialite">
                <span className={styles.relatedTitle}>
                  Politique de confidentialité <span aria-hidden="true">→</span>
                </span>
                <span>Consulter la page dédiée, actuellement à compléter.</span>
              </Link>
              <Link href="/#contact">
                <span className={styles.relatedTitle}>
                  Contacter le domaine <span aria-hidden="true">→</span>
                </span>
                <span>
                  Retrouver les moyens de contact dès qu’ils seront renseignés.
                </span>
              </Link>
            </nav>
            <p className={styles.small}>
              Le responsable du traitement et le point de contact pour les
              questions relatives aux données personnelles restent à identifier.
            </p>
          </LegalCard>
        </div>
      </div>
      <nav
        aria-label="Navigation après les mentions légales"
        className={styles.actions}
      >
        <Link href="/" className="button-secondary">
          <span aria-hidden="true">←</span>Retour à l’accueil
        </Link>
        <a href="#mentions-legales" className={styles.backToTop}>
          Retour au début<span aria-hidden="true">↑</span>
        </a>
      </nav>
    </div>
  );
}
