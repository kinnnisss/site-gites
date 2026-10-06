import { domain, mapUrl } from "@/data/domain";
import { SectionHeading } from "@/components/section-heading";

function Address() {
  return (
    <address className="mt-5 text-base not-italic leading-8 text-muted">
      {domain.address.street}
      <br />
      {domain.address.postalCode} {domain.address.town}
      <br />
      {domain.address.country}
    </address>
  );
}

export function PracticalInfo() {
  return (
    <section
      id="informations"
      tabIndex={-1}
      aria-labelledby="informations-title"
      className="site-width section-space"
    >
      <SectionHeading id="informations-title" eyebrow="Préparer votre venue">
        Les informations pratiques
      </SectionHeading>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-line p-7 md:p-9">
          <h3 className="font-serif text-2xl">Arrivée & départ</h3>
          <dl className="mt-6 space-y-6">
            {[
              ["Arrivée", domain.schedule.arrival],
              ["Départ", domain.schedule.departure],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="eyebrow">{label}</dt>
                <dd className="mt-2 text-lg">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div
          id="localisation"
          className="rounded-xl border border-line bg-paper p-7 md:p-9"
        >
          <h3 className="font-serif text-2xl">Nous trouver</h3>
          <Address />
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-3 text-sm text-accent underline underline-offset-4"
          >
            Ouvrir dans Google Maps{" "}
            <span className="sr-only">(nouvel onglet)</span>
            <span aria-hidden="true">↗</span>
          </a>
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
      className="site-width pb-16 md:pb-20"
    >
      <div className="rounded-2xl bg-accent p-8 text-white md:p-12">
        <p className="text-xs uppercase tracking-[0.2em] text-[#efdbac]">
          Échangeons autour de votre séjour
        </p>
        <h2 id="contact-title" className="mt-4 font-serif text-3xl md:text-4xl">
          Nous contacter
        </h2>
        {links.length > 0 ? (
          <ul className="mt-7 flex flex-wrap gap-4">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="flex min-h-12 flex-col rounded-xl border border-white/50 px-5 py-3 text-sm hover:bg-white/10"
                >
                  <span className="font-semibold">{link.label}</span>
                  <span className="mt-1 break-all">{link.value}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/90">
            Les coordonnées du propriétaire seront prochainement disponibles ici
            pour toute question sur le domaine ou un séjour. Merci de votre
            patience.
          </p>
        )}
        <p className="mt-6 text-xs leading-6 text-white/80">
          Ce site présente le domaine. Il ne propose pas de réservation ni de
          paiement en ligne.
        </p>
      </div>
    </section>
  );
}
