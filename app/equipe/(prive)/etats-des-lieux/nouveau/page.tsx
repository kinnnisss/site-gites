import { requireInspectionPage } from "@/lib/inspections/server";
import DossierEditor from "@/modules/etats-des-lieux/dossier-editor";

export default async function NewInspectionPage() {
  await requireInspectionPage();
  return <DossierEditor dossier={null} />;
}
