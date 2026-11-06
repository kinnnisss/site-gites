/** Real PostgreSQL (PGlite), local fixtures only. This is NOT Supabase Auth validation. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { loadTs } from './load-typescript.mjs';
const require = createRequire(import.meta.url);
const { PGlite } = require(process.env.PGLITE_MODULE_PATH || '@electric-sql/pglite');
const { createInitialPayload } = loadTs('modules/etats-des-lieux/state.ts');
const { parsePayload } = loadTs('modules/etats-des-lieux/persistence.ts');
const db = new PGlite(); let checks = 0;
const ids = Array.from({ length: 6 }, (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`);
const [admin, agentA, agentB, inactive, outsider, dossierId] = ids;
async function actor(id, role = 'authenticated') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id ?? '']);
  await db.exec(`set role ${role}`);
}
async function denied(promise, code = '42501') {
  await assert.rejects(promise, e => e.code === code); checks++;
}
const payload = createInitialPayload();
payload.data.client = 'Test éç\n  espaces  ';
payload.data.guests = ''; payload.data.arriving = '2026-11-05';
payload.data['entry-date'] = '2026-11-05T16:30';
payload.checks.entree[0] = 'corriger'; payload.steps.consignes[7] = true; payload.accepted = true;
const save = (revision, p = payload) => db.query('select * from public.save_inspection_dossier($1,$2,$3::jsonb)', [dossierId, revision, JSON.stringify(p)]);
const remove = (revision, confirmation = dossierId) => db.query('select public.delete_inspection_dossier($1,$2,$3)', [dossierId, revision, confirmation]);
try {
  await db.exec(`create role anon; create role authenticated;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid$$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;`);
  await db.exec(await readFile('supabase/migrations/20261105000100_team_members.sql', 'utf8'));
  await db.exec(await readFile('supabase/migrations/20261105000200_inspection_dossiers.sql', 'utf8'));
  for (const id of ids.slice(0, 5)) await db.query('insert into auth.users values ($1)', [id]);
  for (const [id, role, active] of [[admin, 'admin', true], [agentA, 'agent', true], [agentB, 'agent', true], [inactive, 'agent', false]]) {
    await db.query('insert into public.team_members (user_id,role,active) values ($1,$2,$3)', [id, role, active]);
  }
  // Upgrade an existing dossier, proving the migration preserves data and privileges.
  await actor(agentA); await save(0);
  const beforeUpgrade = (await db.query('select * from public.inspection_dossiers')).rows;
  await db.exec('reset role');
  const privileges = () => db.query(`select n.nspname,p.proname,p.proacl,p.proowner,p.prosecdef,p.provolatile,p.proconfig
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where p.proname in ('stamp_inspection_dossier','save_inspection_dossier','delete_inspection_dossier') order by p.proname`);
  const policies = () => db.query('select polname,polcmd,polroles,polqual::text,polwithcheck::text from pg_policy order by polname');
  const tablePrivileges = () => db.query(`select c.relname,c.relacl,c.relrowsecurity,c.relforcerowsecurity,a.attname,a.attacl
    from pg_class c join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid
    where n.nspname='public' and c.relname in ('team_members','inspection_templates','inspection_dossiers')
    and a.attnum>0 and not a.attisdropped order by c.relname,a.attnum`);
  const beforePrivileges = (await privileges()).rows, beforePolicies = (await policies()).rows;
  const beforeTablePrivileges = (await tablePrivileges()).rows;
  const verificationSql = await readFile('supabase/manual/verify-inspection-pt409.sql', 'utf8');
  const legacyVerification = (await db.exec(verificationSql))[0].rows;
  assert.equal(legacyVerification.length, 3);
  assert.ok(legacyVerification.every(r => r.function_exists && !r.body_matches_versioned_pt409 && !r.has_pt409 && r.has_legacy_40001)); checks++;
  await db.exec(await readFile('supabase/migrations/20261106000100_inspection_business_conflicts.sql', 'utf8'));
  const fixedVerification = (await db.exec(verificationSql))[0].rows;
  assert.equal(fixedVerification.length, 3);
  assert.ok(fixedVerification.every(r => r.function_exists && r.body_matches_versioned_pt409 && r.has_pt409 && !r.has_legacy_40001 && !r.security_definer)); checks++;
  assert.deepEqual((await db.query('select * from public.inspection_dossiers')).rows, beforeUpgrade); checks++;
  assert.deepEqual((await privileges()).rows, beforePrivileges); checks++;
  assert.deepEqual((await policies()).rows, beforePolicies); checks++;
  assert.deepEqual((await tablePrivileges()).rows, beforeTablePrivileges); checks++;
  await actor(admin); await remove(1);
  // SQL and TypeScript must reject the same malformed payloads, preserving drafts.
  const invalid = [null, [], {}, { ...payload, extra: true }, { ...payload, version: 2 },
    { ...payload, data: { ...payload.data, guests: 6 } },
    { ...payload, checks: { ...payload.checks, entree: [] } },
    { ...payload, checks: { ...payload.checks, sortie: Array(13).fill('yes') } },
    { ...payload, steps: { ...payload.steps, sortie: Array(7).fill('false') } },
    { ...payload, accepted: null }];
  for (const p of invalid) {
    assert.throws(() => parsePayload(p));
    assert.equal((await db.query('select public.inspection_payload_valid($1::jsonb) as valid', [JSON.stringify(p)])).rows[0].valid, false); checks++;
  }
  await actor(null, 'anon');
  for (const table of ['inspection_templates', 'inspection_dossiers']) await denied(db.query(`select * from public.${table}`));
  await denied(save(0)); await denied(remove(1));
  await actor(agentA);
  assert.equal((await db.query('select * from public.inspection_templates')).rows.length, 1); checks++;
  assert.equal((await save(0)).rows[0].revision, 1); checks++;
  let row = (await db.query('select * from public.inspection_dossiers')).rows[0];
  assert.deepEqual(row.payload, payload); assert.equal(row.created_by, agentA); assert.equal(row.updated_by, agentA); checks++;
  const creation = row.created_at;
  await denied(save(0), 'PT409'); // Duplicate retry must never create a second row.
  await denied(db.query('update public.inspection_dossiers set payload=$1 where id=$2', [JSON.stringify(payload), dossierId]), 'PT409');
  await denied(db.query('update public.inspection_dossiers set created_by=$1 where id=$2', [admin, dossierId]));
  await denied(db.query('update public.inspection_templates set version=1'));
  assert.equal((await db.query('update public.team_members set role=\'admin\' where user_id=$1 returning user_id', [agentA])).rows.length, 0); checks++;
  await actor(agentB); // Everyone can edit another agent's dossier.
  assert.equal((await db.query('select * from public.inspection_dossiers')).rows.length, 1); checks++;
  const changed = structuredClone(payload); changed.data.reference = 'B';
  assert.equal((await save(1, changed)).rows[0].revision, 2); checks++;
  row = (await db.query('select * from public.inspection_dossiers')).rows[0];
  assert.equal(row.created_by, agentA); assert.equal(row.updated_by, agentB);
  assert.deepEqual(row.created_at, creation); assert.deepEqual(row.payload, changed); checks++;
  await actor(agentA); await denied(save(1), 'PT409');
  assert.deepEqual((await db.query('select payload from public.inspection_dossiers')).rows[0].payload, changed); checks++;
  // Two queued callers both starting with the same revision: exactly one succeeds.
  const race = await Promise.allSettled([save(2), save(2)]);
  assert.equal(race.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(race.find(r => r.status === 'rejected').reason.code, 'PT409'); checks++;
  await denied(remove(3));
  assert.equal((await db.query('delete from public.inspection_dossiers returning id')).rows.length, 0); checks++;
  for (const id of [inactive, outsider]) {
    await actor(id);
    assert.equal((await db.query('select * from public.inspection_dossiers')).rows.length, 0);
    assert.equal((await db.query('select * from public.inspection_templates')).rows.length, 0); checks++;
    await denied(save(3)); await denied(remove(3));
    assert.equal((await db.query('delete from public.inspection_dossiers returning id')).rows.length, 0); checks++;
  }
  await actor(admin);
  assert.equal((await db.query('select * from public.inspection_dossiers')).rows.length, 1); checks++;
  assert.equal((await db.query('delete from public.inspection_dossiers returning id')).rows.length, 0); checks++;
  await denied(save(3, { ...payload, accepted: 'true' }), '23514');
  assert.equal((await save(3)).rows[0].revision, 4); checks++;
  await denied(remove(4, agentA), '22023'); await denied(remove(3), 'PT409');
  assert.equal((await remove(4)).rows[0].delete_inspection_dossier, dossierId); checks++;
  await denied(save(4), 'P0002');
  assert.equal((await db.query('select * from public.inspection_templates')).rows.length, 1); checks++;
  // A role change takes effect for the existing JWT subject on the next operation.
  await db.query('update public.team_members set active=false where user_id=$1', [agentB]);
  await actor(agentB); await denied(save(0));
  console.log(`${checks} local PostgreSQL validation/RLS/metadata/concurrency checks passed. Supabase Auth/remote RLS NOT tested.`);
} finally { await db.close(); }
