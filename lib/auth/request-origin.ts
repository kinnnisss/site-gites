/** Compare the browser Origin to the actual Host, without NextURL's localhost aliasing. */
export function hasSameOrigin(origin: string | null, host: string | null, protocol: string): boolean {
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    return parsed.origin === origin && parsed.host === host.toLowerCase() && parsed.protocol === protocol;
  } catch { return false; }
}
