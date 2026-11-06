import Link from "next/link";
import { redirect } from "next/navigation";
import { requireTeamMember } from "@/lib/auth/authorization";
import { readSupabaseConfig } from "@/lib/supabase/config";
import { AuthForm } from "../../auth-form";
import styles from "../../team.module.css";

const messages: Record<string, string> = {
  indisponible: "La connexion est indisponible. Vérifiez la configuration de développement ou réessayez plus tard.",
  refuse: "Ce compte ne dispose pas d’un accès équipe actif.",
  session: "Connectez-vous pour accéder à l’Espace Équipe. Votre session peut avoir expiré.",
  deconnecte: "Vous êtes déconnecté.",
  lien: "Ce lien de récupération n’est pas valide ou a expiré.",
};

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ etat?: string | string[] }>;
}) {
  const configured = Boolean(readSupabaseConfig(process.env));
  let authorized = false;
  if (configured) {
    try { await requireTeamMember(); authorized = true; }
    catch { /* An absent, refused or unavailable session keeps the login form. */ }
  }
  if (authorized) redirect("/equipe");
  const { etat } = await searchParams;
  const message = !configured ? messages.indisponible
    : typeof etat === "string" && Object.hasOwn(messages, etat) ? messages[etat] : undefined;
  return (
    <main className={styles.page}><div className={styles.card}>
      <p>Domaine Lo Carmalhon</p><h1>Connexion à l’Espace Équipe</h1>
      <p>Accès réservé aux membres autorisés. Aucun compte ne peut être créé depuis cette page.</p>
      {message && <p className={styles.message} role="status">{message}</p>}
      <AuthForm mode="login" configured={configured} />
      <p><Link href="/equipe/recuperation">Mot de passe oublié ?</Link></p>
      <p><Link href="/">Retour au site public</Link></p>
    </div></main>
  );
}
