"use client";

import { useActionState } from "react";
import { requestPasswordReset, signIn, updatePassword, type AuthFormState } from "@/lib/auth/actions";
import styles from "./team.module.css";

export function AuthForm({ mode, configured = true }: {
  mode: "login" | "recovery" | "password";
  configured?: boolean;
}) {
  const action = mode === "login" ? signIn : mode === "recovery" ? requestPasswordReset : updatePassword;
  const [state, submit, pending] = useActionState<AuthFormState, FormData>(action, { message: "" });
  return (
    <form action={submit} className={styles.form}>
      {mode !== "password" && (
        <label>Adresse e-mail<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
      )}
      {mode !== "recovery" && (
        <label>{mode === "password" ? "Nouveau mot de passe" : "Mot de passe"}
          <input name="password" type="password" required maxLength={1024}
            minLength={mode === "password" ? 12 : undefined}
            autoComplete={mode === "password" ? "new-password" : "current-password"} />
        </label>
      )}
      {mode === "password" && (
        <label>Confirmer le mot de passe<input name="confirmation" type="password" required minLength={12} maxLength={1024} autoComplete="new-password" /></label>
      )}
      <p role="status" aria-live="polite">{state.message}</p>
      <button disabled={!configured || pending} type="submit">
        {pending ? "Veuillez patienter…" : mode === "login" ? "Se connecter" : mode === "recovery" ? "Demander un lien" : "Modifier le mot de passe"}
      </button>
    </form>
  );
}
