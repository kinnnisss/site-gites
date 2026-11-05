import { databaseError, DossierError, parseDossier, parseReceipt, type InspectionDossier } from "./persistence";
import type { InspectionStorage } from "./types";

function httpError(status: number) {
  if (status === 401) return new DossierError(401, "Session expirée. Reconnectez-vous dans un autre onglet ; vos saisies sont conservées ici.");
  if (status === 413) return new DossierError(413, "Dossier trop volumineux. Vos saisies sont conservées.");
  return databaseError(status === 409 ? "40001" : status === 404 ? "P0002" : status === 403 ? "42501" : status === 400 ? "22023" : undefined);
}
async function request(url: string, init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(url, { ...init, credentials: "same-origin", cache: "no-store", signal: AbortSignal.timeout(30_000) });
  } catch { throw new DossierError(503, "Connexion interrompue : la sauvegarde n’est pas confirmée. Vos saisies sont conservées ; rechargez après vérification."); }
  if (!response.ok) throw httpError(response.status);
  try { return await response.json() as unknown; }
  catch { throw databaseError(); }
}

/** Metadata stays outside the immutable version-1 export payload. No autosave. */
export function createDossierStorage(initial: InspectionDossier | null, onCreated: (id: string) => void): InspectionStorage {
  let id = initial?.id ?? null;
  let revision = initial?.revision ?? 0;
  let staged: InspectionDossier | null = null;
  return {
    async authorizeExport() {
      await request("/equipe/api/session?operation=inspection-export");
    },
    async save(payload) {
      id ??= crypto.randomUUID(); // Retained even after an ambiguous network failure.
      const creating = revision === 0;
      const receipt = parseReceipt(await request(`/equipe/api/etats-des-lieux${creating ? "" : `/${id}`}`, {
        method: creating ? "POST" : "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creating ? { id, payload } : { revision, payload }),
      }));
      if (receipt.id !== id || receipt.revision !== revision + 1) throw databaseError();
      revision = receipt.revision; staged = null;
      if (creating) onCreated(id);
      return receipt;
    },
    async load() {
      staged = null;
      if (!id) return null;
      const dossier = parseDossier(await request(`/equipe/api/etats-des-lieux/${id}`));
      if (dossier.id !== id) throw databaseError();
      staged = dossier;
      return dossier.payload;
    },
    acceptLoad() {
      // Never advance the revision when the user cancels the original confirmation.
      if (!staged) return;
      const wasNew = revision === 0;
      revision = staged.revision;
      if (wasNew) onCreated(staged.id);
      staged = null;
    },
  };
}
