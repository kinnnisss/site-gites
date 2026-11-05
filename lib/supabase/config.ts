export type SupabaseConfig = { url: string; publishableKey: string };

/** Pure validation; never returns or logs a privileged key. Server callers only. */
export function readSupabaseConfig(env: Record<string, string | undefined>): SupabaseConfig | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".supabase.co") ||
      parsed.username || parsed.password || parsed.search || parsed.hash ||
      (parsed.pathname !== "" && parsed.pathname !== "/")) return null;
    return { url: parsed.origin, publishableKey: key };
  } catch { return null; }
}

/** Explicit trusted origin, never derived from an untrusted Host/returnTo field. */
export function recoveryOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const local = ["localhost", "127.0.0.1"].includes(url.hostname);
    if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
      url.username || url.password || url.search || url.hash || url.pathname !== "/") return null;
    return url.origin;
  } catch { return null; }
}
