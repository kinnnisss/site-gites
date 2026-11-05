import "server-only";
import { redirect } from "next/navigation";
import { createTeamClient } from "../supabase/server";
import { can, isActiveMember, type Permission } from "./policy";

export class TeamAccessError extends Error {
  constructor(public readonly status: 401 | 403 | 503) {
    super("Accès équipe refusé.");
  }
}

/** Fresh server verification on every call. No shared cache or user_metadata role. */
export async function requireTeamMember(permission: Permission = "read_dossiers") {
  let client;
  try { client = await createTeamClient(); }
  catch { throw new TeamAccessError(503); }
  let result;
  try { result = await client.auth.getUser(); }
  catch { throw new TeamAccessError(503); }
  if (result.error || !result.data.user) {
    if (result.error && (result.error.status === 0 || (result.error.status && result.error.status >= 500))) {
      throw new TeamAccessError(503);
    }
    throw new TeamAccessError(401);
  }
  const id = result.data.user.id;
  const { data, error } = await client.from("team_members")
    .select("user_id,role,active").eq("user_id", id).maybeSingle();
  if (error) throw new TeamAccessError(503);
  if (!isActiveMember(id, data) || !can(data, permission)) throw new TeamAccessError(403);
  return { client, member: data };
}

export async function requireTeamPage() {
  try { return await requireTeamMember(); }
  catch (error) {
    const status = error instanceof TeamAccessError ? error.status : 503;
    redirect(`/equipe/connexion?etat=${status === 503 ? "indisponible" : status === 403 ? "refuse" : "session"}`);
  }
}

export function accessErrorResponse(error: unknown) {
  const status = error instanceof TeamAccessError ? error.status : 503;
  return Response.json({ error: status === 503 ? "Service indisponible." : "Accès refusé." }, {
    status, headers: { "Cache-Control": "private, no-store" },
  });
}
