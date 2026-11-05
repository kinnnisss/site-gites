import type { NextRequest } from "next/server";
import { readDossier, removeDossier, requireInspectionMember, writeDossier } from "@/lib/inspections/server";
import { inspectionResponse, inspectionError, readInspectionJson, verifyMutationOrigin } from "@/lib/inspections/http";
import { DossierError, exactObject, validRevision } from "@/modules/etats-des-lieux/persistence";

type Context = { params: Promise<{ id: string }> };
export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const { client } = await requireInspectionMember();
    return inspectionResponse(await readDossier(client, (await params).id));
  } catch (error) { return inspectionError(error); }
}
export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    verifyMutationOrigin(request);
    const { client } = await requireInspectionMember("save_dossier");
    const body = await readInspectionJson(request);
    if (!exactObject(body, ["revision", "payload"]) || !validRevision(body.revision)) throw new DossierError(400, "Requête invalide.");
    return inspectionResponse(await writeDossier(client, (await params).id, body.revision, body.payload));
  } catch (error) { return inspectionError(error); }
}
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    verifyMutationOrigin(request);
    const { client } = await requireInspectionMember("delete_dossier");
    const body = await readInspectionJson(request);
    if (!exactObject(body, ["revision", "confirmation"])) throw new DossierError(400, "Confirmation explicite requise.");
    await removeDossier(client, (await params).id, body.revision, body.confirmation);
    return new Response(null, { status: 204, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return inspectionError(error); }
}
