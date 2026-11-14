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
  "agent-signature"?: string;
  "client-signature"?: string;
};

/** Version-1 contract with optional typed signatures; legacy drafts remain valid. */
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
