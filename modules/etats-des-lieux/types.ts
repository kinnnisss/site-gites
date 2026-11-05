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

/** No implementation is supplied in phase 2; no storage is used by default. */
export type InspectionStorage = {
  save: (payload: InspectionPayload) => Promise<void>;
  load: () => Promise<InspectionPayload | null>;
};

export type InspectionFormHandle = {
  getPayload: () => InspectionPayload;
  replacePayload: (payload: InspectionPayload) => void;
};
