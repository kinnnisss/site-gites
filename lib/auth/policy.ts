import type { TeamMember } from "../supabase/database.types";

export const permissions = [
  "read_dossiers", "create_dossier", "update_dossier", "save_dossier", "export_dossier",
  "manage_team", "delete_dossier",
] as const;
export type Permission = typeof permissions[number];

/** A policy decision, not authentication: the ID must come from auth.getUser(). */
export function isActiveMember(userId: string | null, row: TeamMember | null): row is TeamMember {
  return Boolean(userId && row && row.user_id === userId && row.active === true &&
    (row.role === "admin" || row.role === "agent"));
}

export function can(member: TeamMember, permission: Permission): boolean {
  if (!isActiveMember(member.user_id, member) || !permissions.includes(permission)) return false;
  return !["manage_team", "delete_dossier"].includes(permission) || member.role === "admin";
}
