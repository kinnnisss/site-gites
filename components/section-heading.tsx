import type { ReactNode } from "react";

export function SectionHeading({
  id,
  eyebrow,
  children,
  centered = false,
}: {
  id: string;
  eyebrow: string;
  children: ReactNode;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "section-heading centered" : "section-heading"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="section-title">
        {children}
      </h2>
    </div>
  );
}

export function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="feature-list">
      {items.map((item) => (
        <li key={item}>
          <span aria-hidden="true" className="text-gold">
            —
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
