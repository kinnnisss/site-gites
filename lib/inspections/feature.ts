/** Explicit activation in every environment; identity, permissions and RLS remain separate. */
export function inspectionFeatureEnabled(env: Record<string, string | undefined>): boolean {
  return env.TEAM_INSPECTIONS_ENABLED === "true";
}
