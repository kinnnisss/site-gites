-- DEVELOPMENT ONLY. Review and apply manually after explicit authorization.
-- Add optional text signatures to v1. Existing dossiers are not rewritten.
-- CREATE OR REPLACE preserves the function's owner and EXECUTE privileges.
-- No change to RLS, roles, revision checks, RPCs or dossier metadata.
begin;

create or replace function public.inspection_payload_valid(p jsonb) returns boolean
language plpgsql immutable security invoker set search_path = ''
as $$
declare k text; a jsonb; n integer;
begin
  if jsonb_typeof(p) is distinct from 'object' then return false; end if;
  if not (p ?& array['version','data','checks','steps','accepted']) or
    (select count(*) from jsonb_object_keys(p)) <> 5 or
    p->'version' is distinct from '1'::jsonb or
    jsonb_typeof(p->'accepted') is distinct from 'boolean' then return false; end if;
  if jsonb_typeof(p->'data') is distinct from 'object' or
    jsonb_typeof(p->'checks') is distinct from 'object' or
    jsonb_typeof(p->'steps') is distinct from 'object' then return false; end if;
  if not (p->'data' ?& array['reference','client','arriving','leaving','guests','agent',
    'entry-date','exit-date','entry-notes','exit-notes']) or
    ((p->'data') - array['reference','client','arriving','leaving','guests','agent',
      'entry-date','exit-date','entry-notes','exit-notes','agent-signature','client-signature']) <> '{}'::jsonb or
    exists (select 1 from jsonb_each(p->'data') v where jsonb_typeof(v.value) <> 'string') or
    not (p->'checks' ?& array['entree','sortie']) or
    (select count(*) from jsonb_object_keys(p->'checks')) <> 2 or
    not (p->'steps' ?& array['entree','sortie','consignes']) or
    (select count(*) from jsonb_object_keys(p->'steps')) <> 3 then return false; end if;
  foreach k in array array['entree','sortie'] loop
    a := p->'checks'->k;
    if jsonb_typeof(a) is distinct from 'array' then return false; end if;
    if jsonb_array_length(a) <> 13 or exists (
      select 1 from jsonb_array_elements(a) v
      where v not in ('null'::jsonb, '"conforme"'::jsonb, '"corriger"'::jsonb)
    ) then return false; end if;
  end loop;
  foreach k in array array['entree','sortie','consignes'] loop
    a := p->'steps'->k;
    n := case when k = 'sortie' then 7 else 8 end;
    if jsonb_typeof(a) is distinct from 'array' then return false; end if;
    if jsonb_array_length(a) <> n or exists (
      select 1 from jsonb_array_elements(a) v where jsonb_typeof(v) <> 'boolean'
    ) then return false; end if;
  end loop;
  return true;
end;
$$;

commit;
