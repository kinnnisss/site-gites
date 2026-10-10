"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/data/domain";
import { Brand } from "@/components/brand";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("accueil");
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (pathname !== "/") return;

    let frame = 0;
    function updateActiveSection() {
      frame = 0;
      // La section qui passe dans le haut de l’écran devient la section active.
      const marker = Math.min(window.innerHeight * 0.25, 160);
      let current: string = navigation[0].id;
      for (const link of navigation) {
        const section = document.getElementById(link.id);
        if (section && section.getBoundingClientRect().top <= marker) {
          current = link.id;
        }
      }
      // La dernière section peut être trop courte pour atteindre le repère.
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2
      ) {
        current = navigation[navigation.length - 1].id;
      }
      setActiveSection(current);
    }
    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    }

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
    };
  }, [pathname]);

  function closeMenu() {
    setOpen(false);
    toggle.current?.focus();
  }

  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) closeMenu();
      }}
    >
      <div className="site-width header-inner">
        <Brand />
        <button
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
          className="min-h-11 rounded-full border border-line px-5 text-sm xl:hidden"
        >
          {open ? "Fermer ×" : "Menu ☰"}
        </button>
        <nav
          id="main-navigation"
          aria-label="Navigation principale"
          className={`main-nav ${open ? "is-open" : ""}`}
        >
          {navigation.map((link) => (
            <Link
              key={link.id}
              href={`/#${link.id}`}
              aria-current={
                pathname === "/" && activeSection === link.id
                  ? "location"
                  : undefined
              }
              onClick={() => {
                setOpen(false);
                setActiveSection(link.id);
                document
                  .getElementById(link.id)
                  ?.focus({ preventScroll: true });
              }}
              className={`nav-link ${link.id === "contact" ? "nav-contact" : ""}`}
            >
              {link.id === "contact" ? "Nous contacter" : link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
