-- DEVELOPMENT ONLY. Review and apply manually, after phase 3. No remote execution.
begin;

create function team_private.is_active_team_member() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.team_members
    where user_id = (select auth.uid()) and active and role in ('admin', 'agent')
  );
$$;
revoke all on function team_private.is_active_team_member() from public, anon;
grant execute on function team_private.is_active_team_member() to authenticated;

-- Same version-1 transport contract as copyPayload(). No finalisation rules,
-- date conversions, trimming, coercion or reordering of arrays.
create function public.inspection_payload_valid(p jsonb) returns boolean
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
    (select count(*) from jsonb_object_keys(p->'data')) <> 10 or
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
revoke all on function public.inspection_payload_valid(jsonb) from public, anon;
grant execute on function public.inspection_payload_valid(jsonb) to authenticated;

create table public.inspection_templates (
  id uuid primary key,
  version integer not null unique check (version = 1),
  reference_sha256 text not null check (reference_sha256 ~ '^[0-9a-f]{64}$'),
  definition jsonb not null check (jsonb_typeof(definition) = 'object'),
  created_at timestamptz not null default now()
);

-- Reference snapshot is inserted below, before this migration is committed.

create table public.inspection_dossiers (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.inspection_templates(id) on delete restrict,
  payload jsonb not null check (public.inspection_payload_valid(payload)),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  revision integer not null default 1 check (revision > 0)
);
create index inspection_dossiers_recent on public.inspection_dossiers (updated_at desc, id desc);
create index inspection_dossiers_template on public.inspection_dossiers (template_id);
create index inspection_dossiers_creator on public.inspection_dossiers (created_by);
create index inspection_dossiers_modifier on public.inspection_dossiers (updated_by);

create function team_private.stamp_inspection_dossier() returns trigger
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
      raise exception using errcode = '40001', message = 'Revision conflict';
    end if;
    new.updated_by := auth.uid(); new.updated_at := clock_timestamp();
  end if;
  return new;
end;
$$;
revoke all on function team_private.stamp_inspection_dossier() from public, anon, authenticated;
create trigger inspection_dossier_metadata before insert or update on public.inspection_dossiers
for each row execute function team_private.stamp_inspection_dossier();

alter table public.inspection_templates enable row level security;
alter table public.inspection_templates force row level security;
alter table public.inspection_dossiers enable row level security;
alter table public.inspection_dossiers force row level security;
revoke all on public.inspection_templates, public.inspection_dossiers from public, anon, authenticated;
grant select on public.inspection_templates, public.inspection_dossiers to authenticated;
grant insert (id, template_id, payload), update (payload, revision)
  on public.inspection_dossiers to authenticated;
grant delete on public.inspection_dossiers to authenticated;

create policy inspection_templates_read on public.inspection_templates
for select to authenticated using ((select team_private.is_active_team_member()));
-- No client write grants or policies for templates: retained, immutable snapshots.
create policy inspection_dossiers_read on public.inspection_dossiers
for select to authenticated using ((select team_private.is_active_team_member()));
create policy inspection_dossiers_create on public.inspection_dossiers
for insert to authenticated with check (
  (select team_private.is_active_team_member()) and created_by = (select auth.uid()) and
  updated_by = (select auth.uid()) and revision = 1
);
create policy inspection_dossiers_update on public.inspection_dossiers
for update to authenticated using ((select team_private.is_active_team_member()))
with check ((select team_private.is_active_team_member()) and updated_by = (select auth.uid()));
create policy inspection_dossiers_delete on public.inspection_dossiers
for delete to authenticated using (
  (select team_private.is_active_team_admin()) and
  current_setting('team_private.inspection_delete_confirmation', true) = id::text
);

-- Invoker rights throughout: the caller's JWT, column grants and RLS apply.
-- expected_revision=0 means create. A stable UUID makes retries detectable.
create function public.save_inspection_dossier(p_id uuid, p_expected_revision integer, p_payload jsonb)
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
      raise exception using errcode = '40001', message = 'Revision conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'Dossier not found';
  end if;
end;
$$;
revoke all on function public.save_inspection_dossier(uuid, integer, jsonb) from public, anon;
grant execute on function public.save_inspection_dossier(uuid, integer, jsonb) to authenticated;

create function public.delete_inspection_dossier(p_id uuid, p_expected_revision integer, p_confirmation uuid)
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
      raise exception using errcode = '40001', message = 'Revision conflict';
    end if;
    raise exception using errcode = 'P0002', message = 'Dossier not found';
  end if;
  perform set_config('team_private.inspection_delete_confirmation', '', true);
  return deleted_id;
end;
$$;
revoke all on function public.delete_inspection_dossier(uuid, integer, uuid) from public, anon;
grant execute on function public.delete_inspection_dossier(uuid, integer, uuid) to authenticated;

insert into public.inspection_templates (id, version, reference_sha256, definition)
values ('68a4545f-6af4-4a79-bced-b46cfb367ec1', 1,
  '9b368972d39ac663deb4ae88a9c29c767e956032b8603ac061dae875e30b10f0',
  $snapshot${"payload_version":1,"checks":[["Chambres & literie","Trois chambres propres et aérées ; lits et linge en bon état",false],["Chambres & literie","Serviettes, tapis de bain et torchons disponibles",false],["Salles de bain","Douches, lavabos, WC et sanitaires propres et fonctionnels",false],["Cuisine","Cuisine, vaisselle et plans de travail en bon état",false],["Cuisine","Réfrigérateur, four, micro-ondes et lave-vaisselle fonctionnels",false],["Salon & équipements","Mobilier, télévision, Wi-Fi et climatisation en état",false],["Salon & équipements","Portes, fenêtres, serrures et éclairage fonctionnels",false],["Extérieurs","Terrasse, mobilier et espaces de jardin autorisés en bon état",false],["Extérieurs","Équipements de pétanque et de volley vérifiés",false],["Sécurité","Détecteur de fumée et équipements de sécurité vérifiés",true],["Sécurité","Piscine en travaux inaccessible aux voyageurs",true],["Sécurité","Chantier physiquement sécurisé, accès dangereux impossibles",true],["Clés","Jeu de clés remis à l’entrée / restitué au départ",false]],"steps":{"entree":["Vérifier le nom du titulaire de la réservation.","Faire visiter le gîte avec les vacanciers.","Présenter les principaux équipements et leur fonctionnement.","Expliquer la sécurité et l'interdiction d'accès à la piscine en travaux.","Vérifier ensemble l'état général du logement.","Signaler et noter les éventuelles dégradations déjà présentes.","Remettre un jeu de clés aux vacanciers.","Rappeler les horaires, les contacts utiles et les consignes de départ."],"sortie":["Récupérer les clés en main propre avant 10 h.","Vérifier rapidement l'état général des pièces.","Contrôler les meubles et les équipements principaux.","Signaler toute dégradation constatée.","Vérifier les huit consignes de départ.","Remercier les vacanciers pour leur séjour.","Inviter les vacanciers à laisser un avis sur le gîte."],"consignes":["Faire la vaisselle et vider le lave-vaisselle.","Vider les poubelles en respectant le tri sélectif.","Retirer les aliments personnels du réfrigérateur.","Regrouper les serviettes utilisées dans les salles de bain.","Laisser les draps sur les lits.","Remettre les meubles et objets à leur place.","Fermer les fenêtres et éteindre les lumières.","Restituer les clés en main propre."]},"rules":[["Capacité","Le gîte est prévu pour un maximum de 6 voyageurs. Toute modification du nombre d’occupants doit être confirmée avec le responsable."],["Arrivée et départ","Accueil en personne entre 16 h et 19 h ; départ au plus tard à 10 h. Remise et restitution des clés en main propre."],["Piscine et chantier","La piscine est en travaux, indisponible et strictement interdite d’accès. Les zones de chantier sont interdites aux voyageurs."],["Sécurité","Les enfants restent sous la surveillance d’un adulte responsable. Ne franchissez jamais les protections des zones de travaux."],["Respect des lieux","Prenez soin du mobilier et des équipements ; signalez dès que possible toute panne, fuite ou dégradation constatée."],["Tri et fin de séjour","Respectez le tri des déchets et les huit consignes de départ indiquées dans cette page."],["Assistance","Assistance habituelle de 8 h à 22 h au 07 83 58 63 12. Pour un danger immédiat, appelez d’abord le 112."]]}$snapshot$::jsonb);

commit;
