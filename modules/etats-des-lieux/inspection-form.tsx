"use client";

import { useEffect, useImperativeHandle, useReducer, useRef, useState, type Ref } from "react";
import { flushSync } from "react-dom";
import { referenceLogo } from "./reference-logo";
import { copyPayload, createInitialPayload, inspectionReducer } from "./state";
import type { InspectionFormHandle, InspectionPayload, InspectionStorage, Phase } from "./types";
import { StayInformation } from "./components/fields";
import { HousingInspection } from "./components/housing-inspection";
import { HouseRules, SummaryAndPrint } from "./components/rules-and-summary";
import styles from "./inspection.module.css";
import { DossierError } from "./persistence";

export type InspectionFormProps = {
  initialPayload?: InspectionPayload;
  onPayloadChange?: (payload: InspectionPayload) => void;
  storage?: InspectionStorage;
  ref?: Ref<InspectionFormHandle>;
};

/** The protected editor supplies storage; the reference harness remains storage-free. */
export default function InspectionForm({ initialPayload, onPayloadChange, storage, ref }: InspectionFormProps) {
  const [payload, dispatch] = useReducer(
    inspectionReducer, initialPayload,
    p => p ? copyPayload(p) : createInitialPayload(),
  );
  const [phase, setPhase] = useState<Phase>("entree");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const currentPayload = useRef(payload);

  useImperativeHandle(ref, () => ({
    getPayload: () => copyPayload(payload),
    replacePayload: p => dispatch({ type: "replace", payload: copyPayload(p) }),
  }), [payload]);
  useEffect(() => { currentPayload.current = payload; onPayloadChange?.(copyPayload(payload)); }, [payload, onPayloadChange]);

  async function save() {
    if (busy.current) return;
    if (!storage) {
      setFeedback("Sauvegarde indisponible : aucun stockage n’est connecté.");
      return;
    }
    busy.current = true; setPending(true); setFeedback("Enregistrement en cours…");
    const snapshot = copyPayload(payload);
    try {
      const receipt = await storage.save(snapshot);
      const changed = JSON.stringify(currentPayload.current) !== JSON.stringify(snapshot);
      setFeedback(`${receipt ? `Brouillon enregistré — révision ${receipt.revision}.` : "Brouillon enregistré."}${changed ? " Les saisies faites pendant l’enregistrement restent à sauvegarder." : ""}`);
    } catch (error) {
      setFeedback(error instanceof DossierError ? error.message : "Erreur lors de l’enregistrement. Vos saisies sont conservées.");
    } finally { busy.current = false; setPending(false); }
  }
  async function load() {
    if (busy.current) return;
    if (!storage) {
      setFeedback("Rechargement indisponible : aucun stockage n’est connecté.");
      return;
    }
    busy.current = true; setPending(true); setFeedback("Recherche du brouillon enregistré…");
    try {
      const saved = await storage.load();
      if (!saved) { setFeedback("Aucun brouillon trouvé."); return; }
      const checked = copyPayload(saved);
      if (!window.confirm("Restaurer le brouillon enregistré ?")) { setFeedback("Rechargement annulé. Vos saisies sont conservées."); return; }
      storage.acceptLoad?.();
      dispatch({ type: "replace", payload: checked });
      setFeedback("Brouillon restauré.");
    } catch (error) { setFeedback(error instanceof DossierError ? error.message : "Erreur lors de la restauration. Vos saisies sont conservées."); }
    finally { busy.current = false; setPending(false); }
  }
  function reset() {
    if (busy.current) return;
    if (!window.confirm(storage ? "Effacer les informations du formulaire affiché ? Le dossier enregistré ne sera pas supprimé." : "Effacer les informations de cette maquette et son brouillon local ?")) return;
    dispatch({ type: "reset" });
    setPhase("entree");
    setFeedback("Formulaire réinitialisé.");
  }
  function exportJson() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(copyPayload(currentPayload.current), null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url; link.download = "etat-des-lieux-domaine-lo-carmalhon.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function exportOrPrint(action: () => void) {
    if (busy.current) return;
    if (!storage?.authorizeExport) { action(); return; }
    busy.current = true; setPending(true); setFeedback("Vérification de l’accès…");
    try {
      await storage.authorizeExport();
      // Commit the hidden status before the synchronous native print dialog.
      flushSync(() => setFeedback(null)); action();
    } catch (error) {
      setFeedback(error instanceof DossierError ? error.message : "Vérification de l’accès indisponible. Vos saisies sont conservées.");
    } finally { busy.current = false; setPending(false); }
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
      <div className={styles.notice}>{storage ? <><strong>Sauvegarde partagée — Espace Équipe.</strong> Enregistrez manuellement vos modifications. Le rechargement remplace les saisies par le dernier brouillon enregistré.</> : <><strong>Maquette interactive — pas encore un registre officiel.</strong> Toutes les saisies restent sur votre appareil. Les sauvegardes manuelles ne sont pas synchronisées avec le site.</>}</div>
      <StayInformation data={payload.data} dispatch={dispatch} />
      <HousingInspection phase={phase} setPhase={setPhase} payload={payload} dispatch={dispatch} />
      <HouseRules payload={payload} dispatch={dispatch} />
      <SummaryAndPrint payload={payload} feedback={feedback} pending={pending} connected={Boolean(storage)} actions={{ print: () => exportOrPrint(() => window.print()), save, load, json: () => exportOrPrint(exportJson), reset }} />
      <footer className={styles.footer}><span>Domaine Lo Carmalhon • 8 rue Jean Jaurès, 24410 Saint-Aulaye-Puymangou</span><span>{storage ? "Espace Équipe • sauvegarde manuelle partagée" : "Maquette de validation • sans stockage serveur"}</span></footer>
    </div>
  </main>;
}
