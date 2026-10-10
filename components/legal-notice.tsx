import type { ReactNode } from "react";
import Link from "next/link";
import { domain, addressText } from "@/data/domain";
import { legalDetails } from "@/data/legal";
import { Icon } from "@/components/icon";
import styles from "./legal-notice.module.css";

function LegalCard({
  number,
  title,
  label,
  children,
}: {
  number: string;
  title: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`legal-${number}`} className={styles.card}>
      <div className={styles.cardHeading}>
        <h2 id={`legal-${number}`}>
          <span className={styles.number} aria-hidden="true">
            {number}
          </span>
          {title}
        </h2>
        <span className={styles.badge}>{label}</span>
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
    <div className={`site-width ${styles.page}`}>
      <div className={styles.topbar}>
        <Link href="/" className={styles.backLink}>
          <span aria-hidden="true">←</span>Retour à l’accueil
        </Link>
        <span className={styles.status}>Version à compléter</span>
      </div>
      <header className={styles.intro}>
        <p className={`eyebrow ${styles.eyebrow}`}>
          {domain.name} · Informations juridiques
        </p>
        <h1>Mentions légales</h1>
        <p className={styles.subtitle}>
          Les informations relatives au site
          <br className="hidden sm:block" /> et à sa publication, réunies en
          toute clarté.
        </p>
        <div className={styles.ornament} aria-hidden="true">
          <span />
          <Icon name="shield" />
          <span />
        </div>
        <p className={styles.draft}>
          Ces mentions sont en cours de préparation. Les informations manquantes
          doivent être complétées et l’ensemble validé par le propriétaire avant
          publication.
        </p>
      </header>
      <div className={styles.cards}>
        <LegalCard
          number="01"
          title="Éditeur du site"
          label="Identité & publication"
        >
          <p>
            Ce site présente le {domain.name}. L’identité légale de son éditeur
            et le responsable de sa publication restent à confirmer.
          </p>
          <Details
            rows={[
              { label: "Nom du domaine", value: domain.name },
              { label: "Adresse du domaine", value: addressText },
              { label: "Éditeur légal", value: legalDetails.publisher },
              {
                label: "Statut et identifiants",
                value: [
                  legalDetails.publisherStatus,
                  legalDetails.publisherIdentifiers,
                ]
                  .filter(Boolean)
                  .join(" · "),
              },
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
        <LegalCard
          number="02"
          title="Hébergement"
          label="Informations techniques"
        >
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
        <LegalCard
          number="03"
          title="Propriété intellectuelle"
          label="Contenus & identité"
        >
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
        <LegalCard
          number="04"
          title="Photographies & crédits"
          label="Iconographie"
        >
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
              <strong>Illustration d’ambiance :</strong> le visuel temporaire de
              l’accueil est signalé comme une illustration qui ne représente pas
              le domaine réel.
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
        <LegalCard
          number="05"
          title="Données personnelles & contact"
          label="Vie privée"
        >
          <p>
            Le site vitrine actuel ne propose ni compte utilisateur, ni
            formulaire d’envoi, ni réservation ou paiement en ligne.
          </p>
          <p>
            Les informations relatives aux éventuelles prises de contact, à
            l’hébergement et au traitement des données restent à préciser dans
            la politique de confidentialité.
          </p>
          <div className={styles.related}>
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
          </div>
          <p className={styles.small}>
            Le responsable du traitement et le point de contact pour les
            questions relatives aux données personnelles restent à identifier.
          </p>
        </LegalCard>
      </div>
      <nav
        aria-label="Navigation après les mentions légales"
        className={styles.actions}
      >
        <Link href="/" className="button-secondary">
          <span aria-hidden="true">←</span>Retour à l’accueil
        </Link>
        <Link href="/#contact" className="button-primary">
          Contacter le domaine<span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </div>
  );
}
