import { domain } from "@/data/domain";
import { SectionHeading } from "@/components/section-heading";

export function About() {
  return (
    <section
      id="domaine"
      tabIndex={-1}
      aria-labelledby="domaine-title"
      className="section-space bg-paper"
    >
      <div className="site-width">
        <div className="about-intro">
          <SectionHeading id="domaine-title" eyebrow="L’esprit du lieu">
            Une parenthèse à la campagne,
            <br className="hidden sm:block" /> entre maison et jardin
          </SectionHeading>
          <p className="body-copy">{domain.description}</p>
        </div>
        <dl className="domain-facts">
          {domain.highlights.map((item) => (
            <div key={item.label} className="stat-card">
              <dt className="stat-label">{item.label}</dt>
              <dd className="stat-number">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
