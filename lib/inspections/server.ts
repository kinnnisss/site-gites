import "server-only";
import { redirect } from "next/navigation";
import { requireTeamMember, TeamAccessError } from "@/lib/auth/authorization";
import type { Permission } from "@/lib/auth/policy";
import { databaseError, DossierError, parseDossier, parsePayload, parseReceipt, validId, validRevision } from "@/modules/etats-des-lieux/persistence";

/** Closed until the development Auth/RLS acceptance checklist has been completed. */
export function inspectionsEnabled() {
  return process.env.TEAM_INSPECTIONS_ENABLED === "true" && process.env.VERCEL_ENV !== "production";
}
export async function requireInspectionMember(permission: Permission = "read_dossiers") {
  const access = await requireTeamMember(permission);
  if (!inspectionsEnabled()) throw new TeamAccessError(503);
  return access;
}
export async function requireInspectionPage() {
  try { return await requireInspectionMember(); }
  catch (error) {
    const status = error instanceof TeamAccessError ? error.status : 503;
    if (status === 503) redirect("/equipe?etat=dossiers-indisponibles");
    redirect(`/equipe/connexion?etat=${status === 403 ? "refuse" : "session"}`);
  }
}
type TeamClient = Awaited<ReturnType<typeof requireTeamMember>>["client"];

export async function readDossier(client: TeamClient, id: string) {
  if (!validId(id)) throw new DossierError(404, "Dossier introuvable.");
  const { data, error } = await client.from("inspection_dossiers")
    .select("id,template_id,payload,revision,updated_at").eq("id", id).maybeSingle();
  if (error) throw databaseError(error.code);
  if (!data) throw new DossierError(404, "Dossier introuvable ou supprimé.");
  return parseDossier(data);
}
export async function writeDossier(client: TeamClient, id: string, revision: number, payload: unknown) {
  if (!validId(id) || (revision !== 0 && !validRevision(revision))) throw new DossierError(400, "Requête invalide.");
  const checked = parsePayload(payload);
  const { data, error } = await client.rpc("save_inspection_dossier", {
    p_id: id, p_expected_revision: revision, p_payload: checked,
  });
  if (error) throw databaseError(error.code);
  if (!data || data.length !== 1) throw databaseError();
  const receipt = parseReceipt(data[0]);
  if (receipt.id !== id.toLowerCase() || receipt.revision !== revision + 1) throw databaseError();
  return receipt;
}
export async function removeDossier(client: TeamClient, id: string, revision: unknown, confirmation: unknown) {
  if (!validId(id) || !validRevision(revision) || confirmation !== id) {
    throw new DossierError(400, "Confirmation explicite et révision requises.");
  }
  const { data, error } = await client.rpc("delete_inspection_dossier", {
    p_id: id, p_expected_revision: revision, p_confirmation: id,
  });
  if (error) throw databaseError(error.code);
  if (data !== id.toLowerCase()) throw databaseError();
}

export async function listDossiers(client: TeamClient, query: string, page: number) {
  let request = client.from("inspection_dossiers")
    .select("id,revision,updated_at,reference:payload->data->>reference,client:payload->data->>client")
    .order("updated_at", { ascending: false }).order("id", { ascending: false })
    .range(page * 25, page * 25 + 25);
  if (query) request = request.ilike("payload->data->>reference", `%${query.replace(/[\\%_]/g, "\\$&")}%`);
  const { data, error } = await request;
  if (error) throw databaseError(error.code);
  return { dossiers: (data ?? []).slice(0, 25), hasNext: (data?.length ?? 0) > 25 };
}
