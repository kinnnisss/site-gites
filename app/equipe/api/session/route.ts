import { requireTeamMember, accessErrorResponse } from "@/lib/auth/authorization";

export async function GET() {
  try {
    const { member } = await requireTeamMember();
    return Response.json({ user_id: member.user_id, role: member.role }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) { return accessErrorResponse(error); }
}
