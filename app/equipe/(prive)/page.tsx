import { requireTeamPage } from "@/lib/auth/authorization";
import { signOut } from "@/lib/auth/actions";
import styles from "../team.module.css";
import Link from "next/link";
import { inspectionsEnabled } from "@/lib/inspections/server";

export default async function TeamPage() {
  // Rechecked here: the layout alone is not an authorization boundary.
  const { member } = await requireTeamPage();
  return <main className={styles.page}><div className={styles.card}>
    <p>Domaine Lo Carmalhon</p><h1>Espace Équipe</h1>
    <p>Accès vérifié : {member.role === "admin" ? "administrateur" : "agent"}.</p>
    {inspectionsEnabled() ? <p><Link href="/equipe/etats-des-lieux">Ouvrir les états des lieux</Link></p> :
      <p>L’accès aux dossiers est désactivé sur ce déploiement.</p>}
    <form action={signOut}><button type="submit">Se déconnecter</button></form>
  </div></main>;
}
