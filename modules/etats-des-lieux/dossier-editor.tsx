"use client";

import { useState } from "react";
import InspectionForm from "./inspection-form";
import { createDossierStorage } from "./dossier-storage";
import type { InspectionDossier } from "./persistence";

export default function DossierEditor({ dossier }: { dossier: InspectionDossier | null }) {
  const [storage] = useState(() => createDossierStorage(dossier, id => {
    // Native history preserves unsaved edits made while the request was pending.
    window.history.replaceState(null, "", `/equipe/etats-des-lieux/${id}`);
  }));
  return <InspectionForm initialPayload={dossier?.payload} storage={storage} />;
}
