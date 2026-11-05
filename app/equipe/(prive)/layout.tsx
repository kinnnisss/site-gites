import type { ReactNode } from "react";
import { requireTeamPage } from "@/lib/auth/authorization";

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  await requireTeamPage();
  return children;
}
