import type { NextRequest } from "next/server";
import { requireTeamMember, accessErrorResponse } from "@/lib/auth/authorization";
import { hasSameOrigin } from "@/lib/auth/request-origin";

/** Authorization metadata only; creates no Auth user and sends no invitation. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSameOrigin(request.headers.get("origin"), request.headers.get("host"), request.nextUrl.protocol) ||
    request.headers.get("sec-fetch-site") === "cross-site") {
    return Response.json({ error: "Origine refusée." }, { status: 403 });
  }
  try {
    const { client } = await requireTeamMember("manage_team");
    const { id } = await params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return Response.json({ error: "Identifiant invalide." }, { status: 400 });
    }
    if (request.headers.get("content-type")?.split(";")[0] !== "application/json") {
      return Response.json({ error: "Format refusé." }, { status: 415 });
    }
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ error: "Format invalide." }, { status: 400 });
    const parts: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024) {
        await reader.cancel();
        return new Response(null, { status: 413 });
      }
      parts.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const part of parts) { bytes.set(part, offset); offset += part.byteLength; }
    const text = new TextDecoder().decode(bytes);
    let value;
    try { value = JSON.parse(text); }
    catch { return Response.json({ error: "Format invalide." }, { status: 400 }); }
    if (!value || typeof value !== "object" || Array.isArray(value) ||
      Object.keys(value).length !== 2 || !Object.hasOwn(value, "role") || !Object.hasOwn(value, "active") ||
      (value.role !== "admin" && value.role !== "agent") || typeof value.active !== "boolean") {
      return Response.json({ error: "Modification invalide." }, { status: 400 });
    }
    // RLS independently verifies the current active administrator at write time.
    const { data, error } = await client.from("team_members")
      .update({ role: value.role, active: value.active }).eq("user_id", id).select("user_id");
    if (error || data?.length !== 1) return Response.json({ error: "Modification refusée." }, { status: 403 });
    return new Response(null, { status: 204 });
  } catch (error) { return accessErrorResponse(error); }
}
