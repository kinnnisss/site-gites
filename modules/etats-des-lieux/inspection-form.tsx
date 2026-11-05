"use client";

import { useEffect, useImperativeHandle, useReducer, useState, type Ref } from "react";
import { referenceLogo } from "./reference-logo";
import { copyPayload, createInitialPayload, inspectionReducer } from "./state";
import type { InspectionFormHandle, InspectionPayload, InspectionStorage, Phase } from "./types";
import { StayInformation } from "./components/fields";
import { HousingInspection } from "./components/housing-inspection";
import { HouseRules, SummaryAndPrint } from "./components/rules-and-summary";
import styles from "./inspection.module.css";

export type InspectionFormProps = {
  initialPayload?: InspectionPayload;
  onPayloadChange?: (payload: InspectionPayload) => void;
  storage?: InspectionStorage;
  ref?: Ref<InspectionFormHandle>;
};

/** Not mounted by any application route before server-side access control exists. */
export default function InspectionForm({ initialPayload, onPayloadChange, storage, ref }: InspectionFormProps) {
  const [payload, dispatch] = useReducer(
    inspectionReducer, initialPayload,
    p => p ? copyPayload(p) : createInitialPayload(),
  );
  const [phase, setPhase] = useState<Phase>("entree");
  const [feedback, setFeedback] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    getPayload: () => copyPayload(payload),
    replacePayload: p => dispatch({ type: "replace", payload: copyPayload(p) }),
  }), [payload]);
  useEffect(() => { onPayloadChange?.(copyPayload(payload)); }, [payload, onPayloadChange]);

  async function save() {
    if (!storage) {
      setFeedback("Sauvegarde indisponible : aucun stockage n’est connecté.");
      return;
    }
    try {
      await storage.save(copyPayload(payload));
      setFeedback("Brouillon enregistré.");
    } catch {
      setFeedback("Erreur lors de l’enregistrement.");
    }
  }
  async function load() {
    if (!storage) {
      setFeedback("Rechargement indisponible : aucun stockage n’est connecté.");
      return;
    }
    try {
      const saved = await storage.load();
      if (!saved) { setFeedback("Aucun brouillon trouvé."); return; }
      if (!window.confirm("Restaurer le brouillon enregistré ?")) return;
      dispatch({ type: "replace", payload: copyPayload(saved) });
      setFeedback("Brouillon restauré.");
    } catch { setFeedback("Erreur lors de la restauration."); }
  }
  function reset() {
    if (!window.confirm("Effacer les informations de cette maquette et son brouillon local ?")) return;
    dispatch({ type: "reset" });
    setPhase("entree");
    setFeedback("Formulaire réinitialisé.");
  }
  function exportJson() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(copyPayload(payload), null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url; link.download = "etat-des-lieux-domaine-lo-carmalhon.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <main className={styles.root}>
    <div className={styles.topStripe} />
    <div className={styles.container}>
      <header className={styles.header}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Exact embedded reference PNG; no image transformation. */}
        <img className={styles.logo} alt="Blason du Domaine Lo Carmalhon" src={referenceLogo} />
        <div><span className={styles.eyebrow}>DOMAINE LO CARMALHON</span><h1>État des lieux numérique</h1><p>Entrée · Sortie · Règlement intérieur</p></div>
        <a className={styles.siteLink} href="https://domaine-lo-carmalhon.vercel.app/">Retour au site</a>
      </header>
      <div className={styles.notice}><strong>Maquette interactive — pas encore un registre officiel.</strong> Toutes les saisies restent sur votre appareil. Les sauvegardes manuelles ne sont pas synchronisées avec le site.</div>
      <StayInformation data={payload.data} dispatch={dispatch} />
      <HousingInspection phase={phase} setPhase={setPhase} payload={payload} dispatch={dispatch} />
      <HouseRules payload={payload} dispatch={dispatch} />
      <SummaryAndPrint payload={payload} feedback={feedback} actions={{ print: () => window.print(), save, load, json: exportJson, reset }} />
      <footer className={styles.footer}><span>Domaine Lo Carmalhon • 8 rue Jean Jaurès, 24410 Saint-Aulaye-Puymangou</span><span>Maquette de validation • sans stockage serveur</span></footer>
    </div>
  </main>;
}
