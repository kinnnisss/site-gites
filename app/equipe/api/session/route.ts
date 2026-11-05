import { requireTeamMember, accessErrorResponse } from "@/lib/auth/authorization";
import { requireInspectionMember } from "@/lib/inspections/server";

export async function GET(request: Request) {
  try {
    const { member } = await (new URL(request.url).searchParams.get("operation") === "inspection-export"
      ? requireInspectionMember("export_dossier") : requireTeamMember());
    return Response.json({ user_id: member.user_id, role: member.role }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) { return accessErrorResponse(error); }
}
