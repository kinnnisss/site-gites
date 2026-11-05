export type TeamRole = "admin" | "agent";
export type TeamMember = { user_id: string; role: TeamRole; active: boolean };

import type { InspectionPayload } from "@/modules/etats-des-lieux/types";

type DossierRow = {
  id: string; template_id: string; payload: InspectionPayload;
  created_by: string; created_at: string; updated_by: string; updated_at: string; revision: number;
};

/** Minimal schema matching the versioned migrations. */
export type Database = {
  public: {
    Tables: {
      team_members: {
        Row: TeamMember & { created_at: string };
        Insert: TeamMember & { created_at?: string };
        Update: { role?: TeamRole; active?: boolean };
        Relationships: [];
      };
      inspection_templates: {
        Row: { id: string; version: number; reference_sha256: string; definition: Json; created_at: string };
        Insert: never; Update: never; Relationships: [];
      };
      inspection_dossiers: {
        Row: DossierRow;
        Insert: Pick<DossierRow, "id" | "template_id" | "payload">;
        Update: Pick<DossierRow, "payload" | "revision">;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      save_inspection_dossier: {
        Args: { p_id: string; p_expected_revision: number; p_payload: InspectionPayload };
        Returns: { id: string; revision: number; updated_at: string }[];
      };
      delete_inspection_dossier: {
        Args: { p_id: string; p_expected_revision: number; p_confirmation: string };
        Returns: string;
      };
    };
    Enums: { team_role: TeamRole };
    CompositeTypes: Record<string, never>;
  };
};

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
