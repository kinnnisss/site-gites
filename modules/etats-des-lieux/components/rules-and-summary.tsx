import { rules } from "../reference";
import { completedChecks, type InspectionAction } from "../state";
import type { InspectionPayload } from "../types";
import { Field, SectionHeading } from "./fields";
import styles from "../inspection.module.css";

export function HouseRules({ payload, dispatch }: {
  payload: InspectionPayload;
  dispatch: (action: InspectionAction) => void;
}) {
  return (
    <section className={styles.section}>
      <SectionHeading number="03" title="Règlement intérieur" description="Règles déjà décidées, reprises du guide d’accueil du domaine." />
      <div className={styles.rulesGrid} id="rules">
        {rules.map(([title, text]) => (
          <div className={styles.rule} key={title}><h3>{title}</h3><p>{text}</p></div>
        ))}
      </div>
      <label className={styles.accept}>
        <input
          id="accepted" type="checkbox" checked={payload.accepted}
          onChange={e => dispatch({ type: "accepted", checked: e.target.checked })}
        />
        <span>J’ai pris connaissance du règlement intérieur.<small>Cet accord ne constitue pas une signature électronique certifiée.</small></span>
      </label>
    </section>
  );
}

type Actions = {
  print: () => void;
  save: () => void;
  load: () => void;
  json: () => void;
  reset: () => void;
};

export function SummaryAndPrint({ payload, dispatch, feedback, actions, pending = false, connected = false }: {
  payload: InspectionPayload;
  dispatch: (action: InspectionAction) => void;
  feedback: string | null;
  actions: Actions;
  pending?: boolean;
  connected?: boolean;
}) {
  return (
    <section className={styles.section}>
      <SectionHeading number="04" title="Récapitulatif et impression" description="À l’impression, les contrôles d’entrée et de sortie apparaissent tous les deux." />
      <div className={styles.summaryGrid}>
        <div><strong id="done-entree">{completedChecks(payload, "entree")}/13</strong><span>Contrôles d’entrée</span></div>
        <div><strong id="done-sortie">{completedChecks(payload, "sortie")}/13</strong><span>Contrôles de sortie</span></div>
        <div><strong id="done-rules">{payload.accepted ? "Oui" : "Non"}</strong><span>Règlement lu</span></div>
      </div>
      <div className={styles.signature}>
        {([
          ["agent-signature", "Signature du responsable"],
          ["client-signature", "Signature du voyageur"],
        ] as const).map(([id, label]) => (
          <div key={id}>
            <Field id={id} label={label} placeholder="Saisir le prénom et le nom" value={payload.data[id] ?? ""} dispatch={dispatch} />
            <span className={styles.printSignature} aria-hidden="true">{payload.data[id] || "\u00a0"}</span>
          </div>
        ))}
      </div>
      <p className={styles.disclaimer}>Signez en saisissant votre prénom et votre nom. Cette saisie ne constitue pas une signature électronique certifiée.</p>
      <p id="feedback" className={styles.saveMessage} role="status" aria-live="polite" hidden={feedback === null}>{feedback}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} id="print" onClick={actions.print} disabled={pending}>Imprimer / enregistrer en PDF</button>
        <button type="button" className={styles.secondary} id="save" onClick={actions.save} disabled={pending}>{connected ? "Sauvegarder le brouillon" : "Sauvegarder sur cet appareil"}</button>
        <button type="button" className={styles.secondary} id="load" onClick={actions.load} disabled={pending}>Recharger le brouillon</button>
        <button type="button" className={styles.secondary} id="json" onClick={actions.json} disabled={pending}>Exporter JSON</button>
        <button type="button" className={styles.tertiary} id="reset" onClick={actions.reset} disabled={pending}>Effacer</button>
      </div>
    </section>
  );
}
