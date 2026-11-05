import Link from "next/link";
import { listDossiers, requireInspectionPage } from "@/lib/inspections/server";
import DeleteDossier from "@/modules/etats-des-lieux/delete-dossier";
import styles from "../../team.module.css";

export default async function InspectionListPage({ searchParams }: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { client, member } = await requireInspectionPage();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 200) : "";
  const page = typeof params.page === "string" && /^\d{1,5}$/.test(params.page) ? Number(params.page) : 0;
  let result;
  try { result = await listDossiers(client, q, page); } catch { /* Safe error state, no personal data in logs. */ }
  const pageLink = (number: number) => `/equipe/etats-des-lieux?${new URLSearchParams({ q, page: String(number) })}`;
  return <main className={styles.page}><div className={`${styles.card} ${styles.dossiers}`}>
    <p><Link href="/equipe">Espace Équipe</Link></p><h1>États des lieux</h1>
    <p><Link href="/equipe/etats-des-lieux/nouveau">Nouveau dossier</Link></p>
    <form className={styles.form} action="/equipe/etats-des-lieux" method="get">
      <label>Rechercher par référence de réservation<input name="q" defaultValue={q} maxLength={200} /></label>
      <button type="submit">Rechercher</button>
    </form>
    {!result ? <p role="status">Les dossiers sont indisponibles. Réessayez ultérieurement.</p> : <>
      {result.dossiers.length === 0 && <p>Aucun dossier trouvé.</p>}
      <ul className={styles.dossierList}>{result.dossiers.map(d => <li key={d.id}>
        <Link href={`/equipe/etats-des-lieux/${d.id}`}>{String(d.reference || "Sans référence")} — {String(d.client || "Titulaire non renseigné")}</Link>
        <p>Révision {d.revision} · Modifié le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Dakar" }).format(new Date(d.updated_at))} (UTC)</p>
        {member.role === "admin" && <DeleteDossier id={d.id} revision={d.revision} />}
      </li>)}</ul>
      <nav aria-label="Pages des dossiers">{page > 0 && <Link href={pageLink(page - 1)}>Page précédente</Link>}{result.hasNext && <Link href={pageLink(page + 1)}>Page suivante</Link>}</nav>
    </>}
  </div></main>;
}
