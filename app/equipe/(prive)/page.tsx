import { requireTeamPage } from "@/lib/auth/authorization";
import { signOut } from "@/lib/auth/actions";
import styles from "../team.module.css";

export default async function TeamPage() {
  // Rechecked here: the layout alone is not an authorization boundary.
  const { member } = await requireTeamPage();
  return <main className={styles.page}><div className={styles.card}>
    <p>Domaine Lo Carmalhon</p><h1>Espace Équipe</h1>
    <p>Accès vérifié : {member.role === "admin" ? "administrateur" : "agent"}.</p>
    <p>Les dossiers d’état des lieux ne sont pas encore raccordés. Aucune donnée de séjour n’est chargée.</p>
    <form action={signOut}><button type="submit">Se déconnecter</button></form>
  </div></main>;
}
