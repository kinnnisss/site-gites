-- READ ONLY. Run manually in the confirmed DEVELOPMENT SQL Editor if needed.
-- Never share raw REST/SQL logs containing request.headers, JWTs or passwords.
-- This file executes no DDL/DML and deliberately omits pg_stat_activity.query.

select n.nspname, p.proname, p.prosecdef, p.provolatile, p.proconfig, p.proacl,
       pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where (n.nspname = 'team_private' and p.proname = 'stamp_inspection_dossier')
   or (n.nspname = 'public' and p.proname in ('save_inspection_dossier','delete_inspection_dossier'))
order by n.nspname, p.proname;

select r.rolname, d.datname, setting
from pg_db_role_setting s
left join pg_roles r on r.oid = s.setrole
left join pg_database d on d.oid = s.setdatabase
cross join lateral unnest(s.setconfig) setting
where (r.rolname in ('authenticator','authenticated') or s.setrole = 0)
  and setting ~ '^(statement_timeout|lock_timeout|idle_in_transaction_session_timeout|default_transaction_isolation)=';

select pid, application_name, state, wait_event_type, wait_event,
       xact_start, query_start
from pg_stat_activity
where pid <> pg_backend_pid() and application_name ilike '%postgrest%';

select l.pid, l.locktype, l.mode, l.granted
from pg_locks l
where l.relation = to_regclass('public.inspection_dossiers');
