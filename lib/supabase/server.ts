import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readSupabaseConfig } from "./config";
import type { Database } from "./database.types";

export function authCookieOptions(): CookieOptions {
  return {
    path: "/equipe",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

export async function createTeamClient() {
  const config = readSupabaseConfig(process.env);
  if (!config) throw new Error("TEAM_AUTH_UNAVAILABLE");
  const store = await cookies();
  return createServerClient<Database>(config.url, config.publishableKey, {
    cookieOptions: authCookieOptions(),
    global: {
      fetch: (input, init) => fetch(input, {
        ...init, cache: "no-store", signal: init?.signal ?? AbortSignal.timeout(10_000),
      }),
    },
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        try {
          for (const { name, value, options } of values) store.set(name, value, options);
        } catch {
          // Server Components cannot write cookies. Proxy refreshes before rendering;
          // Actions and Route Handlers use the same adapter with writable cookies.
        }
      },
    },
  });
}
