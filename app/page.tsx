import { CottageIllustration } from "@/components/cottage-illustration";
import { SiteHeader } from "@/components/site-header";
import { demoGites, demoSite } from "@/data/demo";

export default function Home() {
  return (
    <>
      <a href="#contenu" className="skip-link">Aller au contenu</a>
      <div className="bg-olive px-5 py-2.5 text-center text-xs leading-5 tracking-wide text-white">{demoSite.notice}</div>
      <SiteHeader />
      <main id="contenu" tabIndex={-1}>
        <section id="accueil" className="site-width grid items-center gap-10 py-12 md:grid-cols-2 md:gap-14 md:py-20">
          <div>
            <p className="eyebrow">L’art de prendre son temps</p>
            <h1 className="mt-6 max-w-xl font-serif text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">Et si l’on faisait<br />une <em className="font-normal text-clay">parenthèse&nbsp;?</em></h1>
            <p className="mt-7 max-w-md text-base leading-8 text-muted">Une maison de caractère, un coin de verdure, le plaisir d’être ensemble. Imaginez votre prochaine échappée, tout simplement.</p>
            <a href="#gites" className="mt-8 inline-flex min-h-12 items-center gap-8 rounded-full bg-olive px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-foreground">Explorer les gîtes fictifs <span aria-hidden="true">↗</span></a>
            <p className="mt-5 text-xs leading-5 text-muted">Une première esquisse, en attendant les vrais lieux.</p>
          </div>
          <figure className="relative">
            <CottageIllustration className="aspect-[4/3.5] w-full rounded-t-[45%] rounded-b-2xl object-cover" />
            <figcaption className="mt-3 text-right text-xs text-muted">Illustration d’ambiance · lieu imaginaire</figcaption>
          </figure>
        </section>

        <section id="gites" aria-labelledby="gites-title" className="border-y border-line bg-paper py-16 md:py-20">
          <div className="site-width">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div><p className="eyebrow">À chacun sa parenthèse</p><h2 id="gites-title" className="mt-3 font-serif text-4xl md:text-5xl">Des maisons à imaginer</h2></div>
              <p className="max-w-sm text-sm leading-6 text-muted">Ces trois hébergements sont entièrement fictifs. Leurs noms, capacités et descriptions sont des exemples.</p>
            </div>
            <div className="mt-10 grid gap-7 md:grid-cols-3">
              {demoGites.map((gite, index) => (
                <article key={gite.id} className="overflow-hidden rounded-xl border border-line bg-background">
                  <div className="relative"><CottageIllustration palette={gite.palette} className="aspect-[4/3] w-full object-cover" /><span className="absolute left-4 top-4 rounded-full bg-background px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider">Hébergement fictif</span></div>
                  <div className="p-6"><p className="eyebrow text-[10px]">0{index + 1} / {gite.ambiance}</p><h3 className="mt-3 font-serif text-2xl leading-tight">{gite.name}</h3><p className="mt-4 text-sm leading-7 text-muted">{gite.description}</p><p className="mt-6 border-t border-line pt-4 text-sm text-olive">{gite.guests} personnes <span aria-hidden="true" className="mx-2">·</span> {gite.bedrooms} chambre{gite.bedrooms > 1 ? "s" : ""}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="esprit" aria-labelledby="esprit-title" className="site-width grid gap-10 py-16 md:grid-cols-[1fr_1.2fr] md:gap-20 md:py-24">
          <div><p className="eyebrow">L’esprit des lieux</p><h2 id="esprit-title" className="mt-4 font-serif text-4xl leading-tight md:text-5xl">Moins de bruit.<br /><em className="font-normal text-clay">Plus de moments.</em></h2></div>
          <div className="space-y-7">
            {[
              ["01", "Ralentir, enfin", "Un livre ouvert, un café qui s’éternise, une journée sans programme. Voilà l’atmosphère que cette maquette souhaite évoquer."],
              ["02", "Se retrouver", "Imaginer un lieu pour les conversations, les repas partagés et les souvenirs à créer ensemble."],
              ["03", "Faire place à la nature", "Des teintes douces et des illustrations de campagne, en attendant de découvrir l’environnement des véritables gîtes."],
            ].map(([number, title, description]) => <div key={number} className="flex gap-5 border-b border-line pb-7"><span className="pt-1 font-serif text-lg text-clay" aria-hidden="true">{number}</span><div><h3 className="font-serif text-2xl">{title}</h3><p className="mt-2 text-sm leading-7 text-muted">{description}</p></div></div>)}
          </div>
        </section>

        <section id="a-propos" aria-labelledby="demo-title" className="site-width pb-16">
          <div className="rounded-2xl bg-olive p-8 text-white md:p-12"><p className="text-xs uppercase tracking-[0.2em] text-[#e4d5b7]">Un aperçu du futur site</p><h2 id="demo-title" className="mt-4 font-serif text-3xl md:text-4xl">L’histoire reste à écrire.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[#eeeee3]">Le nom de l’entreprise, les hébergements, les photos, les tarifs et les coordonnées seront ajoutés après validation du client. Cette démonstration ne permet ni de consulter des disponibilités réelles, ni de réserver, ni de payer.</p></div>
        </section>
      </main>
      <footer className="border-t border-line py-9"><div className="site-width flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><p className="font-serif text-2xl">{demoSite.name}</p><p className="mt-2 text-xs text-muted">Identité provisoire · Site de démonstration</p></div><a href="#accueil" className="inline-flex min-h-11 items-center gap-4 text-sm text-olive underline-offset-4 hover:underline">Retour en haut <span aria-hidden="true">↑</span></a></div></footer>
    </>
  );
}
