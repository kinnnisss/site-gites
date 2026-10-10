import { domain, mapUrl } from "@/data/domain";
import { SectionHeading } from "@/components/section-heading";
import { Icon } from "@/components/icon";

function Address() {
  return (
    <address className="not-italic">
      <span className="block font-serif text-2xl">{domain.address.street}</span>
      <span className="mt-1 block text-sm leading-6 text-muted">
        {domain.address.postalCode} {domain.address.town}
        <br />
        {domain.address.country}
      </span>
    </address>
  );
}

export function PracticalInfo() {
  return (
    <section
      id="informations"
      tabIndex={-1}
      aria-labelledby="informations-title"
      className="section-space bg-paper"
    >
      <div className="site-width">
        <SectionHeading
          id="informations-title"
          eyebrow="Organisation du séjour"
          centered
        >
          Informations pratiques
        </SectionHeading>
        <p className="section-intro">
          Retrouvez les horaires d’arrivée et de départ ainsi que l’adresse du
          domaine pour préparer votre venue.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="editorial-card">
            <span className="icon-tile">
              <Icon name="clock" />
            </span>
            <h3 className="card-title">Rythme & horaires</h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              Les horaires communiqués par le propriétaire pour votre arrivée et
              votre départ.
            </p>
            <dl className="mt-7 space-y-4">
              {[
                ["Arrivée", domain.schedule.arrival],
                ["Départ", domain.schedule.departure],
              ].map(([label, value]) => (
                <div key={label} className="schedule-row">
                  <Icon name="clock" className="text-gold" />
                  <div>
                    <dt className="text-sm font-medium">{label}</dt>
                    <dd className="mt-1 text-sm leading-6 text-muted">
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-sm italic leading-7 text-muted">
              Pour toute précision sur votre séjour, les moyens de contact
              seront affichés dès qu’ils seront disponibles.
            </p>
          </div>
          <div id="localisation" className="editorial-card">
            <span className="icon-tile">
              <Icon name="pin" />
            </span>
            <h3 className="card-title">Localisation & accès</h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              Le Domaine Lo Carmahon se situe à Saint-Aulaye-Puymangou, en
              Dordogne.
            </p>
            <div className="address-card">
              <p className="eyebrow mb-3">Adresse du domaine</p>
              <Address />
            </div>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="map-link"
            >
              <Icon name="pin" />
              <span>
                Voir sur Google Maps
                <span className="sr-only"> (nouvel onglet)</span>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const phone = domain.contact.phone.trim();
  const whatsapp = domain.contact.whatsapp.trim();
  const email = domain.contact.email.trim();
  const links = [
    ...(phone
      ? [
          {
            label: "Téléphone",
            value: phone,
            href: `tel:${phone.replace(/[\s().-]/g, "")}`,
          },
        ]
      : []),
    ...(whatsapp
      ? [
          {
            label: "WhatsApp",
            value: whatsapp,
            href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
          },
        ]
      : []),
    ...(email
      ? [{ label: "E-mail", value: email, href: `mailto:${email}` }]
      : []),
  ];
  return (
    <section
      id="contact"
      tabIndex={-1}
      aria-labelledby="contact-title"
      className="site-width section-space"
    >
      <div className="contact-panel">
        <div>
          <p className="eyebrow">Échanger avec nous</p>
          <h2 id="contact-title" className="contact-title">
            Prendre contact
            <br />
            avec le domaine
          </h2>
          {links.length > 0 ? (
            <ul className="mt-7 flex flex-wrap gap-4">
              {links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="contact-method">
                    <span className="font-semibold">{link.label}</span>
                    <span className="mt-1 break-all">{link.value}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/90">
              Les coordonnées du propriétaire seront prochainement disponibles
              ici pour toute question sur le domaine ou un séjour. Merci de
              votre patience.
            </p>
          )}
          <p className="contact-note">
            <Icon name="shield" />
            Ce site ne propose pas de réservation ni de paiement en ligne.
          </p>
        </div>
        <div className="contact-address">
          <p className="eyebrow">Nous retrouver</p>
          <p className="mt-3 font-serif text-2xl">{domain.name}</p>
          <p className="mt-2 text-xs leading-6">
            {domain.address.street}
            <br />
            {domain.address.postalCode} {domain.address.town}
          </p>
          <a
            href="#localisation"
            className="mt-5 inline-flex min-h-11 items-center gap-3 text-xs underline underline-offset-4"
          >
            Situer le domaine <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
