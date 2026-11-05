/** Availability only: identity, permissions and RLS are checked separately. */
export function inspectionFeatureEnabled(env: Record<string, string | undefined>): boolean {
  return env.TEAM_INSPECTIONS_ENABLED === "true" && env.VERCEL_ENV !== "production";
}
