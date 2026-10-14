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
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const pendingSection = useRef<string | null>(null);

  useEffect(() => {
    if (pathname !== "/") return;

    const focusFrame = window.requestAnimationFrame(() => {
      if (pendingSection.current) {
        focusSection(pendingSection.current);
        pendingSection.current = null;
      }
    });
    let frame = 0;
    function updateActiveSection() {
      frame = 0;
      // Le repère reste sous l’en-tête, même lorsque celui-ci est fixe au défilement.
      const headerHeight = Math.min(
        header.current?.getBoundingClientRect().height ?? 110,
        110,
      );
      const firstSection = document.getElementById(navigation[0].id);
      const anchorOffset = firstSection
        ? Number.parseFloat(window.getComputedStyle(firstSection).scrollMarginTop) || 0
        : 0;
      const marker = Math.max(headerHeight + 24, anchorOffset + 2);
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
      window.cancelAnimationFrame(focusFrame);
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

  function focusSection(id: string) {
    const section = document.getElementById(id);
    section?.focus({ preventScroll: true });
    section?.scrollIntoView();
  }

  return (
    <header
      ref={header}
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          closeMenu();
        }
      }}
      onBlur={(event) => {
        if (open && !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <div className="site-width header-inner">
        <Brand />
        <button
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen((isOpen) => !isOpen)}
          className="header-menu-toggle"
        >
          <span>{open ? "Fermer" : "Menu"}</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d={open ? "M6 6l12 12M6 18L18 6" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
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
              scroll={false}
              aria-current={
                pathname === "/" && activeSection === link.id
                  ? "location"
                  : undefined
              }
              onNavigate={() => {
                setOpen(false);
                setActiveSection(link.id);
                if (pathname === "/") {
                  // Attendre la fermeture du menu avant de positionner l’ancre.
                  window.requestAnimationFrame(() => focusSection(link.id));
                } else {
                  pendingSection.current = link.id;
                }
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
