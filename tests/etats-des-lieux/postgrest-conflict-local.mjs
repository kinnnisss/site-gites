/** Real local PostgREST + PostgreSQL. No Supabase connection or Auth simulation in the app. */
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';

const suffix = randomBytes(5).toString('hex');
const version = process.argv.find(a => a.startsWith('--postgrest-version='))?.split('=')[1] ?? '13.0.7';
assert.ok(['13.0.7', '14.18'].includes(version), 'Use an explicitly supported local PostgREST version');
const restImage = 'postgrest/postgrest:v' + version;
const network = 'recette-conflict-' + suffix, pg = network + '-pg', rest = network + '-rest';
const folder = await mkdtemp('/tmp/site-gites-postgrest-lab-');
const output = `/tmp/site-gites-recette/postgrest-lab-${Date.now()}.json`;
await mkdir('/tmp/site-gites-recette', { recursive: true });
const report = { mode: 'local-postgrest-not-supabase', started_at: new Date().toISOString(), postgres_image: 'postgres:17-alpine', postgrest_image: restImage, tests: [], success: false };
const env = { ...process.env };
for (const key of ['DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_TLS', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH']) delete env[key];
const args = ['--host=unix:///var/run/docker.sock'];
const docker = (...a) => promisify(execFile)('docker', [...args, ...a], { env, maxBuffer: 8 * 1024 * 1024 });
const check = (name, value) => { report.tests.push({ name, passed: Boolean(value) }); assert.ok(value, name); };
async function sql(text) {
  const c = spawn('docker', [...args, 'exec', '-i', pg, 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1'], { env, stdio: ['pipe', 'pipe', 'pipe'] });
  let errors = ''; c.stdout.resume(); c.stderr.on('data', b => { errors += b; }); c.stdin.on('error', () => {}); c.stdin.end(text);
  const result = await new Promise((yes, no) => { c.once('error', no); c.once('close', yes); });
  if (result !== 0) report.local_sql_error = errors.replaceAll(password ?? 'unused-secret', '[REDACTED]').slice(0, 1200);
  assert.equal(result, 0, 'Local SQL setup failed');
}
let base;
let stage = 'initialization', password;
async function request(path, body) {
  const started = performance.now();
  try {
    const r = await fetch(base + path, { method: body ? 'POST' : 'GET', headers: body ? { 'content-type': 'application/json' } : {}, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(4000) });
    const data = await r.json();
    return { http: r.status, sqlstate: data?.code ?? null, data, elapsed_ms: Math.round((performance.now() - started) * 10) / 10 };
  } catch (e) { return { http: null, sqlstate: null, category: e?.name === 'TimeoutError' ? 'transport-timeout' : 'transport-error', elapsed_ms: Math.round((performance.now() - started) * 10) / 10 }; }
}
async function ready() {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(base + '/revision_lab', { signal: AbortSignal.timeout(500) })).ok) return; } catch {}
    await delay(100);
  }
  throw new Error('Local PostgREST not ready');
}
try {
  await docker('info', '--format', '{{.ServerVersion}}');
  password = randomBytes(24).toString('hex');
  await writeFile(folder + '/postgres.env', `POSTGRES_PASSWORD=${password}\n`, { mode: 0o600 });
  await writeFile(folder + '/postgrest.env', `PGRST_DB_URI=postgres://postgres:${password}@${pg}:5432/postgres\nPGRST_DB_ANON_ROLE=lab_actor\nPGRST_DB_SCHEMAS=public\n`, { mode: 0o600 });
  await docker('network', 'create', network);
  await docker('run', '-d', '--name', pg, '--network', network, '--env-file', folder + '/postgres.env', 'postgres:17-alpine', '-c', 'log_error_verbosity=verbose', '-c', 'log_min_error_statement=panic');
  let pgReady = false;
  for (let i = 0; i < 80; i++) {
    // The image's temporary init server listens only on a Unix socket. Wait for TCP.
    try { await docker('exec', pg, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres'); pgReady = true; break; } catch {}
    await delay(100);
  }
  check('local_postgres_ready', pgReady);
  const functionSql = (name, code) => `create function public.${name}(p_id uuid,p_expected integer,p_payload text) returns table(id uuid,revision integer,payload text)
language plpgsql security invoker set search_path='' as $$ begin
if p_expected=0 then return query insert into public.revision_lab as d values(p_id,1,p_payload) on conflict do nothing returning d.id,d.revision,d.payload;
else return query update public.revision_lab as d set payload=p_payload,revision=p_expected+1 where d.id=p_id and d.revision=p_expected returning d.id,d.revision,d.payload; end if;
if not found then
if exists(select 1 from public.revision_lab d where d.id=p_id) then
raise exception using errcode='${code}',message='Revision conflict';
end if;
raise exception using errcode='P0002',message='Dossier not found';
end if; end; $$;`;
  stage = 'local-schema';
  await sql(`create role lab_actor nologin; grant usage on schema public to lab_actor;
create table public.revision_lab(id uuid primary key,revision integer not null,payload text not null);
grant select,insert,update,delete on public.revision_lab to lab_actor;
${functionSql('legacy_save', '40001')}
${functionSql('fixed_save', 'PT409')}`);
  stage = 'postgrest-start';
  await docker('run', '-d', '--name', rest, '--network', network, '--env-file', folder + '/postgrest.env', '-p', '127.0.0.1::3000', restImage);
  const port = (await docker('inspect', '--format', '{{(index (index .NetworkSettings.Ports "3000/tcp") 0).HostPort}}', rest)).stdout.trim();
  base = 'http://127.0.0.1:' + port; stage = 'postgrest-ready'; await ready();
  const oldId = randomUUID(), duplicateId = randomUUID(), fixedId = randomUUID();
  const save = (name, id, revision, payload) => request('/rpc/' + name, { p_id: id, p_expected: revision, p_payload: payload });
  check('legacy_create', (await save('legacy_save', oldId, 0, 'A')).http === 200);
  check('legacy_update', (await save('legacy_save', oldId, 1, 'B')).data?.[0]?.revision === 2);
  let settledCount = 0;
  const stale = ['obsolete-A', 'obsolete-B'].map(payload => save('legacy_save', oldId, 1, payload).then(r => { settledCount++; return r; }));
  await delay(600); check('both_legacy_conflicts_still_pending', settledCount === 0);
  const logs = await docker('logs', '--tail', '10000', pg);
  report.sql_40001_log_count = ((logs.stdout + logs.stderr).match(/40001/g) ?? []).length;
  check('two_http_requests_retried_in_postgres', report.sql_40001_log_count > 2);
  await sql(`delete from public.revision_lab where id='${oldId}';`);
  report.legacy_stale_after_delete = await Promise.all(stale);
  check('both_requests_finish_as_P0002_HTTP500_after_delete', report.legacy_stale_after_delete.every(r => r.http === 500 && r.sqlstate === 'P0002'));
  await save('legacy_save', duplicateId, 0, 'first');
  let settled = false;
  const duplicate = save('legacy_save', duplicateId, 0, 'replayed').then(r => { settled = true; return r; });
  await delay(600); check('duplicate_legacy_creation_pending', !settled);
  await sql(`delete from public.revision_lab where id='${duplicateId}';`);
  report.legacy_duplicate_after_delete = await duplicate;
  const reappeared = await request('/revision_lab?id=eq.' + duplicateId);
  check('pending_create_recreates_after_delete', report.legacy_duplicate_after_delete.http === 200 && reappeared.data?.length === 1 && reappeared.data[0].payload === 'replayed');
  check('fixed_create', (await save('fixed_save', fixedId, 0, 'A')).data?.[0]?.revision === 1);
  check('fixed_normal_update', (await save('fixed_save', fixedId, 1, 'B')).data?.[0]?.revision === 2);
  report.fixed_stale = await save('fixed_save', fixedId, 1, 'obsolete');
  check('fixed_stale_delivered', report.fixed_stale.http === 409 && report.fixed_stale.sqlstate === 'PT409');
  report.fixed_duplicate = await save('fixed_save', fixedId, 0, 'duplicate');
  check('fixed_duplicate_delivered', report.fixed_duplicate.http === 409 && report.fixed_duplicate.sqlstate === 'PT409');
  const race = await Promise.all([save('fixed_save', fixedId, 2, 'winner-A'), save('fixed_save', fixedId, 2, 'winner-B')]);
  report.fixed_race = race;
  check('fixed_concurrent_one_winner', race.filter(r => r.http === 200 && r.data?.[0]?.revision === 3).length === 1 && race.filter(r => r.http === 409 && r.sqlstate === 'PT409').length === 1);
  const winner = race.find(r => r.http === 200).data[0];
  check('fixed_winning_payload_preserved', (await request('/revision_lab?id=eq.' + fixedId)).data?.[0]?.payload === winner.payload);
  await sql(`delete from public.revision_lab where id='${fixedId}';`);
  await delay(250);
  check('fixed_no_late_recreation', (await request('/revision_lab?id=eq.' + fixedId)).data?.length === 0);
  report.success = true;
} catch (e) {
  report.failed_stage = stage;
  report.failure = String(e.message).replaceAll(password ?? 'unused-secret', '[REDACTED]').slice(0, 1600);
  try {
    report.local_container_state = (await docker('inspect', '--format', '{{.State.Status}} {{.State.ExitCode}}', rest)).stdout.trim();
    const log = await docker('logs', '--tail', '20', rest);
    report.local_startup_diagnostic = (log.stdout + log.stderr).replaceAll(password ?? 'unused-secret', '[REDACTED]').slice(0, 2200);
  } catch {}
  process.exitCode = 1;
}
finally {
  for (const name of [rest, pg]) { try { await docker('rm', '-f', name); } catch {} }
  try { await docker('network', 'rm', network); } catch {}
  await rm(folder, { recursive: true, force: true });
  await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ report: output, ...report }, null, 2));
}
