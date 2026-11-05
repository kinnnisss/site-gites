import { requireTeamPage } from "@/lib/auth/authorization";
import { AuthForm } from "../../auth-form";
import styles from "../../team.module.css";

export default async function PasswordPage() {
  await requireTeamPage();
  return <main className={styles.page}><div className={styles.card}>
    <h1>Nouveau mot de passe</h1>
    <p>Utilisez au moins 12 caractères. Vous devrez ensuite vous reconnecter.</p>
    <AuthForm mode="password" />
  </div></main>;
}
