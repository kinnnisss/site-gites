-- REVIEW ONLY: run manually against the verified DEVELOPMENT project.
begin;

create type public.team_role as enum ('admin', 'agent');

create table public.team_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.team_role not null default 'agent',
  active boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.team_members enable row level security;
revoke all on public.team_members from public, anon, authenticated;
grant select on public.team_members to authenticated;
grant insert (user_id, role, active), update (role, active)
  on public.team_members to authenticated;

create schema team_private;
revoke all on schema team_private from public;
grant usage on schema team_private to authenticated;

-- Non-exposed helper avoids recursive RLS and takes no caller-supplied identity.
create function team_private.is_active_team_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.team_members
    where user_id = (select auth.uid()) and active and role = 'admin'
  );
$$;
revoke all on function team_private.is_active_team_admin() from public, anon;
grant execute on function team_private.is_active_team_admin() to authenticated;

create policy team_members_read on public.team_members
for select to authenticated
using (
  (user_id = (select auth.uid()) and active) or
  (select team_private.is_active_team_admin())
);

create policy team_members_admin_insert on public.team_members
for insert to authenticated
with check ((select team_private.is_active_team_admin()));

create policy team_members_admin_update on public.team_members
for update to authenticated
using ((select team_private.is_active_team_admin()))
with check (
  (select team_private.is_active_team_admin()) and
  (user_id <> (select auth.uid()) or (active and role = 'admin'))
);

-- No DELETE grant/policy, no signup trigger, no public bootstrap function.
-- Inspection tables and their RLS belong to phase 4.
commit;
