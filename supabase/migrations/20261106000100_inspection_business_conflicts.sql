-- DEVELOPMENT REVIEW REQUIRED. Do not execute remotely without owner authorization.
-- Optimistic revision conflicts are permanent business errors, not retryable
-- PostgreSQL serialization failures (40001). PT409 is delivered as HTTP 409 by
-- PostgREST, including deployments whose Hasql transaction wrapper retries 40001.
-- Only the three error codes change. UUID/revision conditions, metadata, INVOKER,
-- search_path, grants, RLS, schema and existing dossier contents are preserved.
-- Compare remote definitions before applying; do not overwrite unknown changes.
begin;

do $prerequisites$
begin
  if to_regprocedure('team_private.stamp_inspection_dossier()') is null or
     to_regprocedure('public.save_inspection_dossier(uuid,integer,jsonb)') is null or
     to_regprocedure('public.delete_inspection_dossier(uuid,integer,uuid)') is null then
    raise exception 'Missing inspection migration prerequisites';
  end if;
end;
$prerequisites$;

create or replace function team_private.stamp_inspection_dossier() returns trigger
language plpgsql security invoker set search_path = ''
as $$
begin
  if not team_private.is_active_team_member() then
    raise exception using errcode = '42501', message = 'Access denied';
  end if;
  if tg_op = 'INSERT' then
    new.created_by := auth.uid(); new.updated_by := auth.uid();
    new.created_at := clock_timestamp(); new.updated_at := new.created_at;
    new.revision := 1;
  else
    if new.id is distinct from old.id or new.template_id is distinct from old.template_id or
      new.created_by is distinct from old.created_by or new.created_at is distinct from old.created_at then
      raise exception using errcode = '42501', message = 'Immutable metadata';
    end if;
    -- A direct Data API PATCH that omits the next revision also fails.
    if old.revision = 2147483647 or new.revision <> old.revision + 1 then
      raise exception using errcode = 'PT409', message = 'Revision conflict';
    end if;
    new.updated_by := auth.uid(); new.updated_at := clock_timestamp();
  end if;
  return new;
end;
$$;

create or replace function public.save_inspection_dossier(p_id uuid, p_expected_revision integer, p_payload jsonb)
returns table (id uuid, revision integer, updated_at timestamptz)
language plpgsql security invoker set search_path = ''
as $$
begin
  if not team_private.is_active_team_member() then
    raise exception using errcode = '42501', message = 'Access denied';
  end if;
  if p_id is null or p_expected_revision is null or p_expected_revision < 0 or
    p_expected_revision = 2147483647 then
    raise exception using errcode = '22023', message = 'Invalid request';
  end if;
  if p_expected_revision = 0 then
    return query insert into public.inspection_dossiers as d (id, template_id, payload)
      values (p_id, '68a4545f-6af4-4a79-bced-b46cfb367ec1', p_payload)
      on conflict do nothing returning d.id, d.revision, d.updated_at;
  else
    return query update public.inspection_dossiers as d
      set payload = p_payload, revision = p_expected_revision + 1
      where d.id = p_id and d.revision = p_expected_revision
      returning d.id, d.revision, d.updated_at;
  end if;
  if not found then
    if exists (select 1 from public.inspection_dossiers d where d.id = p_id) then
      raise exception using errcode = 'PT409', message = 'Revision conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'Dossier not found';
  end if;
end;
$$;

create or replace function public.delete_inspection_dossier(p_id uuid, p_expected_revision integer, p_confirmation uuid)
returns uuid language plpgsql security invoker set search_path = ''
as $$
declare deleted_id uuid;
begin
  if not team_private.is_active_team_admin() then
    raise exception using errcode = '42501', message = 'Access denied';
  end if;
  if p_id is null or p_confirmation is distinct from p_id or
    p_expected_revision is null or p_expected_revision < 1 then
    raise exception using errcode = '22023', message = 'Explicit confirmation required';
  end if;
  -- Transaction-local confirmation: a raw Data API DELETE has no such setting.
  -- This is additional confirmation, never a substitute for the administrator RLS.
  perform set_config('team_private.inspection_delete_confirmation', p_id::text, true);
  delete from public.inspection_dossiers d where d.id = p_id and d.revision = p_expected_revision
    returning d.id into deleted_id;
  if deleted_id is null then
    if exists (select 1 from public.inspection_dossiers d where d.id = p_id) then
      raise exception using errcode = 'PT409', message = 'Revision conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'Dossier not found';
  end if;
  perform set_config('team_private.inspection_delete_confirmation', '', true);
  return deleted_id;
end;
$$;

commit;
