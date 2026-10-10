import type { Metadata } from "next";
import localFont from "next/font/local";
import { domain } from "@/data/domain";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const newsreader = localFont({
  src: [
    {
      path: "./fonts/newsreader-regular.woff2",
      weight: "400",
      style: "normal",
    },
    { path: "./fonts/newsreader-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "400 600",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: domain.seo.title, template: `%s | ${domain.name}` },
  description: domain.seo.description,
  ...(domain.siteUrl ? { metadataBase: new URL(domain.siteUrl) } : {}),
  openGraph: {
    title: domain.seo.title,
    description: domain.seo.description,
    siteName: domain.name,
    locale: "fr_FR",
    type: "website",
    ...(domain.siteUrl ? { url: domain.siteUrl } : {}),
  },
  // Prépublication : activer l’indexation une fois les contenus et mentions validés.
  robots: { index: false, follow: false },
  icons: {
    icon: "/images/logo-domaine-lo-carmahon.jpeg",
    apple: "/images/logo-domaine-lo-carmahon.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${newsreader.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <SiteHeader />
        <main id="contenu" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
