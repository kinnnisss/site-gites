import Link from "next/link";
import { readSupabaseConfig, recoveryOrigin } from "@/lib/supabase/config";
import { AuthForm } from "../../auth-form";
import styles from "../../team.module.css";

export default function RecoveryPage() {
  const configured = Boolean(readSupabaseConfig(process.env) && recoveryOrigin(process.env.TEAM_APP_ORIGIN));
  return <main className={styles.page}><div className={styles.card}>
    <p>Domaine Lo Carmalhon</p><h1>Récupérer l’accès</h1>
    <p>La récupération concerne uniquement les comptes existants et ne crée pas de compte.</p>
    {!configured && <p role="status">La récupération n’est pas encore configurée. Contactez l’administrateur.</p>}
    <AuthForm mode="recovery" configured={configured} />
    <Link href="/equipe/connexion">Retour à la connexion</Link>
  </div></main>;
}
