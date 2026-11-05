import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { readSupabaseConfig } from "./lib/supabase/config";

/** Session renewal only. Authorization remains in every page/data operation. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = readSupabaseConfig(process.env);
  if (config) {
    const client = createServerClient(config.url, config.publishableKey, {
      cookieOptions: {
        path: "/equipe", httpOnly: true, sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
      global: {
        fetch: (input, init) => fetch(input, {
          ...init, cache: "no-store", signal: init?.signal ?? AbortSignal.timeout(10_000),
        }),
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values, headers) {
          for (const { name, value } of values) request.cookies.set(name, value);
          const previous = response.cookies.getAll();
          response = NextResponse.next({ request });
          for (const cookie of previous) response.cookies.set(cookie);
          for (const { name, value, options } of values) response.cookies.set(name, value, options);
          for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
        },
      },
    });
    try { await client.auth.getUser(); }
    catch { /* Fail closed in authorization; never grant access from a cookie alone. */ }
  }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Cookie");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export const config = { matcher: ["/equipe/:path*"] };
