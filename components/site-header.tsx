"use client";

import { useRef, useState } from "react";
import { demoSite } from "@/data/demo";

const links = [
  { href: "#gites", label: "Les gîtes" },
  { href: "#esprit", label: "L’esprit des lieux" },
  { href: "#a-propos", label: "À propos de la démo" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header className="border-b border-line bg-background">
      <div className="site-width flex flex-wrap items-center justify-between gap-4 py-5">
        <a href="#accueil" aria-label={`${demoSite.name}, accueil`} className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-t-full border border-olive text-2xl text-olive">⌂</span>
          <span><span className="block font-serif text-2xl">{demoSite.name}</span><span className="block text-[10px] uppercase tracking-[0.18em] text-muted">{demoSite.label}</span></span>
        </a>
        <button ref={toggle} type="button" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)} className="min-h-11 rounded-full border border-line px-5 text-sm md:hidden">
          {open ? "Fermer ×" : "Menu ☰"}
        </button>
        <nav id="main-navigation" aria-label="Navigation principale" className={`${open ? "flex" : "hidden"} w-full flex-col gap-2 md:flex md:w-auto md:flex-row md:items-center md:gap-6`} onKeyDown={(event) => {
          if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
        }}>
          {links.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-md px-2 py-3 text-sm text-olive underline-offset-4 hover:underline">{link.label}</a>)}
        </nav>
      </div>
    </header>
  );
}
