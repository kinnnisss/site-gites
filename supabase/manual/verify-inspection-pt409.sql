-- READ ONLY: development project jijjjgsfdbrkvqvhyjwr, SQL Editor only.
-- No function execution, DDL, DML, user IDs, tokens or dossier contents.
-- Compares complete versioned bodies, normalizing only CRLF and outer newlines.
-- A mismatch requires inspection; do not reapply a migration automatically.
with expected(signature, body_md5) as (values
  ('team_private.stamp_inspection_dossier()', '7691e39052cdcafba26b2f57e32a3c83'),
  ('public.save_inspection_dossier(uuid,integer,jsonb)', '071206c069615067352fad697f44f89c'),
  ('public.delete_inspection_dossier(uuid,integer,uuid)', '6fc5f205b860dd68aed593f78d22be9b')
)
select e.signature, p.oid is not null as function_exists,
       md5(btrim(replace(p.prosrc, E'\r\n', E'\n'), E'\n')) = e.body_md5 as body_matches_versioned_pt409,
       position('PT409' in p.prosrc) > 0 as has_pt409,
       position('40001' in p.prosrc) > 0 as has_legacy_40001,
       p.prosecdef as security_definer, p.proconfig, p.proacl
from expected e left join pg_proc p on p.oid = to_regprocedure(e.signature)
order by e.signature;

-- Current protection state, not a historical before/after comparison.
select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('team_members','inspection_templates','inspection_dossiers')
order by c.relname;

select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename in ('team_members','inspection_templates','inspection_dossiers')
order by tablename, policyname;
