export type Phase = "entree" | "sortie";
export type ChecklistGroup = Phase | "consignes";
export type Choice = null | "conforme" | "corriger";

export type InspectionData = {
  reference: string;
  client: string;
  arriving: string;
  leaving: string;
  guests: string;
  agent: string;
  "entry-date": string;
  "exit-date": string;
  "entry-notes": string;
  "exit-notes": string;
};

/** Exact version-1 export contract. Dates and the guest count remain strings. */
export type InspectionPayload = {
  version: 1;
  data: InspectionData;
  checks: Record<Phase, Choice[]>;
  steps: Record<ChecklistGroup, boolean[]>;
  accepted: boolean;
};

/** Optional transport adapter; dossier metadata never enters the version-1 payload. */
export type InspectionStorage = {
  save: (payload: InspectionPayload) => Promise<void | { id: string; revision: number; updated_at: string }>;
  load: () => Promise<InspectionPayload | null>;
  acceptLoad?: () => void;
  authorizeExport?: () => Promise<void>;
};

export type InspectionFormHandle = {
  getPayload: () => InspectionPayload;
  replacePayload: (payload: InspectionPayload) => void;
};
