import { NextResponse, type NextRequest } from "next/server";
import { createTeamClient } from "@/lib/supabase/server";
import { requireTeamMember } from "@/lib/auth/authorization";
import { recoveryOrigin } from "@/lib/supabase/config";

function goTo(path: "/equipe/mot-de-passe" | "/equipe/connexion?etat=lien") {
  // A fixed relative Location preserves the browser's host, even on loopback.
  return new NextResponse(null, { status: 307, headers: { Location: path, "Cache-Control": "private, no-store" } });
}

export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (recoveryOrigin(process.env.TEAM_APP_ORIGIN) &&
    type === "recovery" && hash && /^[A-Za-z0-9_-]{16,512}$/.test(hash)) {
    try {
      const client = await createTeamClient();
      const { error } = await client.auth.verifyOtp({ token_hash: hash, type: "recovery" });
      if (!error) {
        await requireTeamMember();
        return goTo("/equipe/mot-de-passe");
      }
    } catch { /* Never echo tokens, provider errors or a caller-supplied next URL. */ }
  }
  return goTo("/equipe/connexion?etat=lien");
}
