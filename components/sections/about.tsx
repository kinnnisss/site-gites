import { domain } from "@/data/domain";
import { SectionHeading } from "@/components/section-heading";

export function About() {
  return (
    <section
      id="domaine"
      tabIndex={-1}
      aria-labelledby="domaine-title"
      className="border-y border-line bg-paper py-16 md:py-20"
    >
      <div className="site-width">
        <div className="grid gap-7 md:grid-cols-2 md:gap-16">
          <SectionHeading id="domaine-title" eyebrow="Bienvenue chez nous">
            Bienvenue au {domain.name}
          </SectionHeading>
          <p className="text-base leading-8 text-muted">{domain.description}</p>
        </div>
        <dl className="mt-12 grid grid-cols-2 gap-x-5 gap-y-8 border-t border-line pt-9 md:grid-cols-4">
          {domain.highlights.map((item) => (
            <div key={item.label} className="flex flex-col">
              <dt className="order-2 mt-3 text-sm text-muted">{item.label}</dt>
              <dd className="font-serif text-4xl text-accent sm:text-5xl">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
