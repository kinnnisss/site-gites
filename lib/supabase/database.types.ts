export type TeamRole = "admin" | "agent";
export type TeamMember = { user_id: string; role: TeamRole; active: boolean };

/** Minimal schema matching the reviewed migration; no inspection tables. */
export type Database = {
  public: {
    Tables: {
      team_members: {
        Row: TeamMember & { created_at: string };
        Insert: TeamMember & { created_at?: string };
        Update: { role?: TeamRole; active?: boolean };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { team_role: TeamRole };
    CompositeTypes: Record<string, never>;
  };
};
