import type { InspectionAction } from "../state";
import type { InspectionData } from "../types";
import styles from "../inspection.module.css";

type FieldProps = {
  id: keyof InspectionData;
  label: string;
  value: string;
  dispatch: (action: InspectionAction) => void;
  placeholder?: string;
  type?: "date" | "datetime-local" | "number";
  multiline?: boolean;
};

export function Field({ id, label, value, dispatch, placeholder, type, multiline }: FieldProps) {
  const props = {
    id, value, placeholder,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      dispatch({ type: "field", field: id, value: event.target.value }),
  };
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {multiline ? <textarea {...props} rows={4} /> :
        <input {...props} type={type} min={type === "number" ? 1 : undefined} max={type === "number" ? 6 : undefined} />}
    </label>
  );
}

export function SectionHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className={styles.sectionHeading}>
      <span className={styles.num}>{number}</span>
      <div><h2>{title}</h2><p>{description}</p></div>
    </div>
  );
}

export function StayInformation({ data, dispatch }: { data: InspectionData; dispatch: (action: InspectionAction) => void }) {
  return (
    <section className={styles.section}>
      <SectionHeading number="01" title="Informations du séjour" description="À remplir avec le responsable du domaine." />
      <div className={styles.formGrid}>
        <Field id="reference" label="Référence de réservation" placeholder="EX : LC-2026-001" value={data.reference} dispatch={dispatch} />
        <Field id="client" label="Titulaire de la réservation" placeholder="Nom du voyageur" value={data.client} dispatch={dispatch} />
        <Field id="arriving" label="Date d’arrivée" type="date" value={data.arriving} dispatch={dispatch} />
        <Field id="leaving" label="Date de départ" type="date" value={data.leaving} dispatch={dispatch} />
        <Field id="guests" label="Nombre de voyageurs" type="number" value={data.guests} dispatch={dispatch} />
        <Field id="agent" label="Responsable du contrôle" value={data.agent} dispatch={dispatch} />
      </div>
    </section>
  );
}
