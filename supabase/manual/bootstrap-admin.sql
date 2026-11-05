-- MANUAL ONLY: SQL Editor, verified DEVELOPMENT project, trusted postgres role.
-- Create/confirm the development Auth user in the dashboard first.
-- Replace ONLY the UUID below with that user's verified ID. Never add secrets.
begin;
do $$
declare
  target_user uuid := '00000000-0000-0000-0000-000000000000';
begin
  if current_user <> 'postgres' then
    raise exception 'Trusted SQL administrator required';
  end if;
  perform pg_advisory_xact_lock(67439120261105);
  if exists (select 1 from public.team_members where role = 'admin' and active) then
    raise exception 'An active administrator already exists';
  end if;
  if not exists (
    select 1 from auth.users where id = target_user and email_confirmed_at is not null
  ) then
    raise exception 'Select a confirmed development Auth user first';
  end if;
  insert into public.team_members (user_id, role, active)
  values (target_user, 'admin', true)
  on conflict (user_id) do update set role = 'admin', active = true;
end;
$$;
commit;
