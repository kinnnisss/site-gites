import "server-only";
import type { NextRequest } from "next/server";
import { accessErrorResponse } from "@/lib/auth/authorization";
import { hasSameOrigin } from "@/lib/auth/request-origin";
import { DossierError } from "@/modules/etats-des-lieux/persistence";
export { readInspectionJson } from "./request-body";

export function inspectionResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
}
export function inspectionError(error: unknown) {
  if (error instanceof DossierError) return inspectionResponse({ error: error.message }, error.status);
  return accessErrorResponse(error);
}
export function verifyMutationOrigin(request: NextRequest) {
  if (!hasSameOrigin(request.headers.get("origin"), request.headers.get("host"), request.nextUrl.protocol) ||
    request.headers.get("sec-fetch-site") === "cross-site") throw new DossierError(403, "Origine refusée.");
}
