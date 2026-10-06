import type { ReactNode } from "react";

export function SectionHeading({
  id,
  eyebrow,
  children,
}: {
  id: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2
        id={id}
        className="mt-4 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl"
      >
        {children}
      </h2>
    </div>
  );
}

export function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-muted">
          <span aria-hidden="true" className="text-gold">
            —
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
