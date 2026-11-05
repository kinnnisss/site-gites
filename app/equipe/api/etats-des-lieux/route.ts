import type { NextRequest } from "next/server";
import { requireInspectionMember, writeDossier } from "@/lib/inspections/server";
import { inspectionResponse, inspectionError, readInspectionJson, verifyMutationOrigin } from "@/lib/inspections/http";
import { DossierError, exactObject, validId } from "@/modules/etats-des-lieux/persistence";

export async function POST(request: NextRequest) {
  try {
    verifyMutationOrigin(request);
    const { client } = await requireInspectionMember("create_dossier");
    const body = await readInspectionJson(request);
    if (!exactObject(body, ["id", "payload"]) || !validId(body.id)) throw new DossierError(400, "Requête invalide.");
    return inspectionResponse(await writeDossier(client, body.id, 0, body.payload), 201);
  } catch (error) { return inspectionError(error); }
}
