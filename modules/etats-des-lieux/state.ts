import type {
  ChecklistGroup,
  Choice,
  InspectionData,
  InspectionPayload,
  Phase,
} from "./types";

export function createInitialPayload(): InspectionPayload {
  return {
    version: 1,
    data: {
      reference: "",
      client: "",
      arriving: "",
      leaving: "",
      guests: "6",
      agent: "",
      "entry-date": "",
      "exit-date": "",
      "entry-notes": "",
      "exit-notes": "",
    },
    checks: {
      entree: Array<Choice>(13).fill(null),
      sortie: Array<Choice>(13).fill(null),
    },
    steps: {
      entree: Array<boolean>(8).fill(false),
      sortie: Array<boolean>(7).fill(false),
      consignes: Array<boolean>(8).fill(false),
    },
    accepted: false,
  };
}

/** Validate the transport shape without imposing completion or new business rules. */
export function copyPayload(value: InspectionPayload): InspectionPayload {
  const sample = createInitialPayload();
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null && !Array.isArray(v);
  const sameKeys = (v: unknown, keys: string[]) =>
    isRecord(v) && Object.keys(v).length === keys.length &&
    keys.every(k => Object.hasOwn(v, k));
  if (!sameKeys(value, ["version", "data", "checks", "steps", "accepted"]) ||
    value.version !== 1 || typeof value.accepted !== "boolean" ||
    !sameKeys(value.data, Object.keys(sample.data)) ||
    !Object.values(value.data).every(v => typeof v === "string") ||
    !sameKeys(value.checks, ["entree", "sortie"]) ||
    !sameKeys(value.steps, ["entree", "sortie", "consignes"])) {
    throw new Error("Format de dossier invalide.");
  }
  for (const phase of ["entree", "sortie"] as const) {
    const a = value.checks[phase];
    if (!Array.isArray(a) || a.length !== 13 ||
      Array.from(a).some(v => v !== null && v !== "conforme" && v !== "corriger")) {
      throw new Error("Format des contrôles invalide.");
    }
  }
  for (const group of ["entree", "sortie", "consignes"] as const) {
    const a = value.steps[group];
    if (!Array.isArray(a) || a.length !== sample.steps[group].length ||
      Array.from(a).some(v => typeof v !== "boolean")) {
      throw new Error("Format des procédures invalide.");
    }
  }
  return structuredClone(value);
}

export type InspectionAction =
  | { type: "field"; field: keyof InspectionData; value: string }
  | { type: "choice"; phase: Phase; index: number; value: Exclude<Choice, null> }
  | { type: "step"; group: ChecklistGroup; index: number; checked: boolean }
  | { type: "accepted"; checked: boolean }
  | { type: "replace"; payload: InspectionPayload }
  | { type: "reset" };

export function inspectionReducer(
  state: InspectionPayload,
  action: InspectionAction,
): InspectionPayload {
  switch (action.type) {
    case "field":
      return { ...state, data: { ...state.data, [action.field]: action.value } };
    case "choice":
      return {
        ...state,
        checks: {
          ...state.checks,
          [action.phase]: state.checks[action.phase].map((value, index) =>
            index === action.index
              ? (value === action.value ? null : action.value)
              : value),
        },
      };
    case "step":
      return {
        ...state,
        steps: {
          ...state.steps,
          [action.group]: state.steps[action.group].map((value, index) =>
            index === action.index ? action.checked : value),
        },
      };
    case "accepted":
      return { ...state, accepted: action.checked };
    case "replace":
      return copyPayload(action.payload);
    case "reset":
      return createInitialPayload();
  }
}

export const completedChecks = (payload: InspectionPayload, phase: Phase) =>
  payload.checks[phase].filter(v => v !== null).length;
