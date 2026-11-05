"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Separate from Effacer; rendered only in the administrator's dossier list. */
export default function DeleteDossier({ id, revision }: { id: string; revision: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function remove() {
    if (pending || !window.confirm("Supprimer définitivement ce dossier et toutes ses données d’entrée et de sortie ? Cette action est irréversible.")) return;
    setPending(true); setMessage(null);
    try {
      const response = await fetch(`/equipe/api/etats-des-lieux/${id}`, {
        method: "DELETE", credentials: "same-origin", cache: "no-store", signal: AbortSignal.timeout(30_000),
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision, confirmation: id }),
      });
      if (response.status !== 204) {
        setMessage(response.status === 409 ? "Le dossier a changé. Actualisez la liste avant de confirmer à nouveau." : "Suppression refusée ou indisponible.");
        return;
      }
      router.refresh();
    } catch { setMessage("Suppression non confirmée. Actualisez la liste pour vérifier son état."); }
    finally { setPending(false); }
  }
  return <><button type="button" onClick={remove} disabled={pending}>Supprimer définitivement</button>{message && <p role="status">{message}</p>}</>;
}
