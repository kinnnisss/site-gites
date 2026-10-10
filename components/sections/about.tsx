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
        <div className="max-w-[680px]">
          <SectionHeading id="domaine-title" eyebrow="L’esprit du lieu">
            Une parenthèse à la campagne,
            <br className="hidden sm:block" /> entre maison et jardin
          </SectionHeading>
          <div className="gold-rule" />
          <p className="body-copy">{domain.description}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domain.highlights.map((item) => (
            <article key={item.label} className="stat-card">
              <p className="stat-number">{item.value}</p>
              <p className="stat-label">{item.label}</p>
              <div className="mt-7">
                <h3 className="font-serif text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
