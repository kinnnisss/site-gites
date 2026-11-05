import { copyPayload } from "./state";
import type { InspectionPayload } from "./types";

export const TEMPLATE_ID = "68a4545f-6af4-4a79-bced-b46cfb367ec1";
export type DossierReceipt = { id: string; revision: number; updated_at: string };
export type InspectionDossier = DossierReceipt & { template_id: string; payload: InspectionPayload };

export class DossierError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}
export function validId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
export function validRevision(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0 && (value as number) < 2147483647;
}
export function exactObject(value: unknown, keys: string[]): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every(k => Object.hasOwn(value, k));
}
export function parsePayload(value: unknown): InspectionPayload {
  try { return copyPayload(value as InspectionPayload); }
  catch { throw new DossierError(400, "Format de dossier invalide."); }
}
export function parseReceipt(value: unknown): DossierReceipt {
  if (!exactObject(value, ["id", "revision", "updated_at"]) || !validId(value.id) ||
    !Number.isInteger(value.revision) || (value.revision as number) < 1 ||
    (value.revision as number) > 2147483647 || typeof value.updated_at !== "string" ||
    !Number.isFinite(Date.parse(value.updated_at))) {
    throw new DossierError(503, "Réponse du stockage invalide. Vos saisies sont conservées.");
  }
  return value as DossierReceipt;
}
export function parseDossier(value: unknown): InspectionDossier {
  if (!exactObject(value, ["id", "revision", "updated_at", "template_id", "payload"]) || value.template_id !== TEMPLATE_ID) {
    throw new DossierError(503, "Version de dossier non prise en charge.");
  }
  return {
    ...parseReceipt({ id: value.id, revision: value.revision, updated_at: value.updated_at }),
    template_id: TEMPLATE_ID, payload: parsePayload(value.payload),
  };
}
export function databaseError(code?: string): DossierError {
  if (code === "40001" || code === "23505") return new DossierError(409,
    "Conflit : une autre sauvegarde existe. Vos saisies sont conservées. Exportez-les avant de recharger le brouillon.");
  if (code === "P0002") return new DossierError(404, "Dossier introuvable ou supprimé. Vos saisies sont conservées.");
  if (code === "42501") return new DossierError(403, "Accès refusé. Vos saisies sont conservées.");
  if (["23514", "22023", "22P02"].includes(code ?? "")) return new DossierError(400, "Format de dossier invalide.");
  return new DossierError(503, "Stockage indisponible. Vos saisies sont conservées.");
}
