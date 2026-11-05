import Link from "next/link";
import { notFound } from "next/navigation";
import { readDossier, requireInspectionPage } from "@/lib/inspections/server";
import { DossierError } from "@/modules/etats-des-lieux/persistence";
import DossierEditor from "@/modules/etats-des-lieux/dossier-editor";
import styles from "../../../team.module.css";

export default async function InspectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { client } = await requireInspectionPage();
  let dossier;
  try { dossier = await readDossier(client, (await params).id); }
  catch (error) {
    if (error instanceof DossierError && error.status === 404) notFound();
    return <main className={styles.page}><div className={styles.card}>
      <h1>Dossier indisponible</h1><p>Le dossier n’a pas pu être chargé. Réessayez depuis la liste.</p>
      <Link href="/equipe/etats-des-lieux">Revenir aux dossiers</Link>
    </div></main>;
  }
  return <DossierEditor key={dossier.id} dossier={dossier} />;
}
