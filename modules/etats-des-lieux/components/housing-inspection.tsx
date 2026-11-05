import { checks, stepsList } from "../reference";
import { completedChecks, type InspectionAction } from "../state";
import type { ChecklistGroup, InspectionPayload, Phase } from "../types";
import { Field, SectionHeading } from "./fields";
import styles from "../inspection.module.css";

type Props = {
  payload: InspectionPayload;
  dispatch: (action: InspectionAction) => void;
};

function Checklist({ group, payload, dispatch }: Props & { group: ChecklistGroup }) {
  return (
    <div className={styles.steps} id={`steps-${group}`}>
      {stepsList[group].map((text, index) => (
        <label className={styles.step} key={index}>
          <input
            type="checkbox"
            data-group={group}
            data-idx={index}
            checked={payload.steps[group][index]}
            onChange={e => dispatch({ type: "step", group, index, checked: e.target.checked })}
          />
          <span>{text}</span>
        </label>
      ))}
    </div>
  );
}

function CheckTable({ phase, payload, dispatch }: Props & { phase: Phase }) {
  return (
    <div className={styles.checkTable} id={`checks-${phase}`}>
      <div className={styles.checkHeader}>
        <span>Point à contrôler</span><span>Conforme</span><span>À corriger</span>
      </div>
      {checks.map(([area, description, critical], index) => (
        <div className={styles.checkRow} key={index}>
          <div className={styles.checkDescription}>
            <span className={styles.area}>{area}</span>
            <span>{description + (critical ? " " : "")}{critical && <strong className={styles.critical}>• sécurité</strong>}</span>
          </div>
          {(["conforme", "corriger"] as const).map(value => {
            const on = payload.checks[phase][index] === value;
            return (
              <button
                className={styles.choice}
                type="button"
                key={value}
                data-phase={phase}
                data-idx={index}
                data-value={value}
                aria-pressed={on}
                aria-label={`${value} : ${description}`}
                data-status={on ? value : ""}
                onClick={() => dispatch({ type: "choice", phase, index, value })}
              >
                {on ? "✓" : "□"}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function InspectionPhase({ phase, active, payload, dispatch }: Props & {
  phase: Phase;
  active: boolean;
}) {
  const entry = phase === "entree";
  const dateId = entry ? "entry-date" : "exit-date";
  const notesId = entry ? "entry-notes" : "exit-notes";
  return (
    <div id={`phase-${phase}`} className={`${styles.phase}${active ? "" : ` ${styles.hiddenPhase}`}`}>
      <h3>{entry ? "État des lieux d’entrée" : "État des lieux de sortie"}</h3>
      <Field
        id={dateId} label="Date et heure du contrôle" type="datetime-local"
        value={payload.data[dateId]} dispatch={dispatch}
      />
      <CheckTable phase={phase} payload={payload} dispatch={dispatch} />
      <Field
        id={notesId}
        label={entry ? "Observations et défauts déjà présents" : "Observations et anomalies nouvelles"}
        placeholder={entry ? "Ex : rayure préexistante sur une table..." : "Décrivez les différences avec l’entrée..."}
        multiline value={payload.data[notesId]} dispatch={dispatch}
      />
      <h4>{entry ? "Procédure d’arrivée • 8 actions" : "Procédure de départ • 7 actions"}</h4>
      <Checklist group={phase} payload={payload} dispatch={dispatch} />
      {!entry && (
        <>
          <h4>Huit consignes de départ</h4>
          <Checklist group="consignes" payload={payload} dispatch={dispatch} />
        </>
      )}
    </div>
  );
}

export function HousingInspection({ phase, setPhase, payload, dispatch }: Props & {
  phase: Phase;
  setPhase: (phase: Phase) => void;
}) {
  const warning = checks.some((check, i) => check[2] && (
    payload.checks.entree[i] === "corriger" || payload.checks.sortie[i] === "corriger"
  ));
  return (
    <section className={styles.section}>
      <SectionHeading number="02" title="Contrôle du logement" description="Cochez « Conforme » ou « À corriger ». Cliquez à nouveau pour décocher." />
      <div className={styles.tabBar}>
        {(["entree", "sortie"] as const).map(p => (
          <button
            type="button" id={`tab-${p}`} key={p}
            className={phase === p ? styles.customTabActive : undefined}
            onClick={() => setPhase(p)}
          >
            {p === "entree" ? "Arrivée" : "Départ"} <span id={`progress-${p}`}>{completedChecks(payload, p)}/13</span>
          </button>
        ))}
      </div>
      <div className={styles.progressTrack}>
        <span id="progress-track" style={{ width: `${completedChecks(payload, phase) / 13 * 100}%` }} />
      </div>
      <InspectionPhase phase="entree" active={phase === "entree"} payload={payload} dispatch={dispatch} />
      <InspectionPhase phase="sortie" active={phase === "sortie"} payload={payload} dispatch={dispatch} />
      <div id="safety-warning" className={styles.warning} hidden={!warning}>
        <strong>Attention :</strong> un point de sécurité nécessite une correction avant toute nouvelle arrivée.
      </div>
    </section>
  );
}
