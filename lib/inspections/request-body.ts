import { DossierError } from "../../modules/etats-des-lieux/persistence";

/** Pure transport validation; authentication remains in each server route. */
export async function readInspectionJson(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new DossierError(415, "Format JSON requis.");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new DossierError(400, "Requête invalide.");
  const parts: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1_048_576) { await reader.cancel(); throw new DossierError(413, "Dossier trop volumineux. Vos saisies sont conservées."); }
      parts.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const part of parts) { bytes.set(part, offset); offset += part.byteLength; }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown;
  } catch (error) {
    if (error instanceof DossierError) throw error;
    throw new DossierError(400, "JSON invalide.");
  } finally { reader.releaseLock(); }
}
