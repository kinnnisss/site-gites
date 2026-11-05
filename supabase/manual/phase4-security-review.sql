-- READ ONLY. Run manually in the verified DEVELOPMENT project, after approval.
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('team_members', 'inspection_templates', 'inspection_dossiers')
order by tablename, policyname;

select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity, c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('inspection_templates', 'inspection_dossiers');

select n.nspname as schema_name, p.proname, p.prosecdef as security_definer
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where (n.nspname = 'public' and p.proname in ('save_inspection_dossier', 'delete_inspection_dossier', 'inspection_payload_valid'))
  or (n.nspname = 'team_private' and p.proname in ('is_active_team_admin', 'is_active_team_member', 'stamp_inspection_dossier'))
order by schema_name, proname;

select id, version, reference_sha256 from public.inspection_templates;
-- No dossier contents, users, JWTs, secrets or personal information are selected.
