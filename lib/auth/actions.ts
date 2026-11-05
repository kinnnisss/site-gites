"use server";

import { redirect } from "next/navigation";
import { createTeamClient } from "../supabase/server";
import { recoveryOrigin } from "../supabase/config";
import { requireTeamMember } from "./authorization";

export type AuthFormState = { message: string };
const genericLoginError = "Connexion refusée. Vérifiez vos identifiants et votre accès équipe.";
const unavailable = "Connexion indisponible. Réessayez plus tard.";
const isEmail = (value: FormDataEntryValue | null): value is string =>
  typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function signIn(_state: AuthFormState, form: FormData): Promise<AuthFormState> {
  const email = form.get("email");
  const password = form.get("password");
  if (!isEmail(email) || typeof password !== "string" || !password || password.length > 1024) {
    return { message: genericLoginError };
  }
  try {
    const client = await createTeamClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error?.status === 0 || (error?.status && error.status >= 500)) return { message: unavailable };
    if (error || !data.user) return { message: genericLoginError };
    try { await requireTeamMember(); }
    catch {
      await client.auth.signOut({ scope: "local" });
      return { message: genericLoginError };
    }
  } catch { return { message: unavailable }; }
  // Fixed destination: never trust a returnTo/next supplied by the browser.
  redirect("/equipe");
}

export async function signOut(): Promise<never> {
  try {
    const client = await createTeamClient();
    await client.auth.signOut({ scope: "local" });
  } catch { /* Local logout still works when the Auth server is unavailable. */ }
  const { cookies } = await import("next/headers");
  const store = await cookies();
  for (const { name } of store.getAll()) {
    if (name.startsWith("sb-")) store.set(name, "", {
      path: "/equipe", maxAge: 0, httpOnly: true, sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  redirect("/equipe/connexion?etat=deconnecte");
}

export async function requestPasswordReset(_state: AuthFormState, form: FormData): Promise<AuthFormState> {
  const origin = recoveryOrigin(process.env.TEAM_APP_ORIGIN);
  if (!origin) return { message: "La récupération n’est pas encore configurée. Contactez l’administrateur." };
  const email = form.get("email");
  if (!isEmail(email)) return { message: "Vérifiez le format de l’adresse e-mail." };
  try {
    const client = await createTeamClient();
    await client.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/equipe/confirmation` });
  } catch { /* Same response for known/unknown addresses and transport failures. */ }
  return { message: "Si cette adresse dispose d’un compte, un lien de récupération pourra lui être envoyé." };
}

export async function updatePassword(_state: AuthFormState, form: FormData): Promise<AuthFormState> {
  let client;
  try { ({ client } = await requireTeamMember()); }
  catch { return { message: "Session absente ou accès refusé. Recommencez la récupération." }; }
  const password = form.get("password");
  if (typeof password !== "string" || password.length < 12 || password.length > 1024 ||
    password !== form.get("confirmation")) {
    return { message: "Utilisez au moins 12 caractères et confirmez le même mot de passe." };
  }
  try {
    const { error } = await client.auth.updateUser({ password });
    if (error) return { message: "Modification refusée. Le lien ou la session doit être renouvelé." };
  } catch { return { message: unavailable }; }
  return signOut();
}
