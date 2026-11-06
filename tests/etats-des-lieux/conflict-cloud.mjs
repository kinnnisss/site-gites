/** Manual Cloud reproduction. One generated UUID, no account/schema mutations. */
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import { loadTs } from './load-typescript.mjs';
import { matchesDevelopmentProject, allowedFixtureRequest } from './development-target.mjs';

const { readSupabaseConfig } = loadTs('lib/supabase/config.ts');
const { createInitialPayload } = loadTs('modules/etats-des-lieux/state.ts');
const { parsePayload, REVISION_CONFLICT_SQLSTATE } = loadTs('modules/etats-des-lieux/persistence.ts');
class Stop extends Error {}
const ensure = (ok, label) => { if (!ok) throw new Stop(label); };
ensure(process.argv.includes('--allow-development-writes'), 'Explicit development-write authorization required.');
const expectedConflict = process.argv.includes('--legacy-40001') ? '40001' : REVISION_CONFLICT_SQLSTATE;
const branch = (await promisify(execFile)('git', ['branch', '--show-current'])).stdout.trim();
ensure(branch === 'fix/recette-espace-equipe', 'Wrong branch.');
const config = readSupabaseConfig(process.env);
ensure(config && process.env.VERCEL_ENV !== 'production' && matchesDevelopmentProject(config.url, process.env.TEAM_TEST_EXPECTED_PROJECT_REF), 'Development project mismatch.');
const names = ['ADMIN', 'AGENT_A', 'AGENT_B', 'INACTIVE', 'NO_MEMBER'];
ensure(names.every(n => process.env[`TEAM_TEST_${n}_EMAIL`] && process.env[`TEAM_TEST_${n}_PASSWORD`]), 'Missing fixture credentials.');
ensure(new Set(names.map(n => process.env[`TEAM_TEST_${n}_EMAIL`].trim().toLowerCase())).size === 5, 'Fixture accounts not distinct.');
const id = randomUUID(), output = `/tmp/site-gites-recette/conflict-${Date.now()}.json`;
await mkdir('/tmp/site-gites-recette', { recursive: true });
const report = { started_at: new Date().toISOString(), project_ref: new URL(config.url).hostname.split('.')[0], synthetic_id: id, branch, expected_conflict: expectedConflict, metrics: [], checks: [], success: false };
const clients = {}, tokens = {}, subjects = {};
let attempted = false;
const checkpoint = async () => {
  await writeFile(output + '.tmp', JSON.stringify(report, null, 2) + '\n');
  await rename(output + '.tmp', output);
};
const mark = (name, ok) => { report.checks.push({ name, passed: Boolean(ok) }); ensure(ok, name); };
const code = value => typeof value === 'string' && /^[A-Za-z0-9_]{1,32}$/.test(value) ? value : null;
const same = (a, b) => JSON.stringify(parsePayload(a)) === JSON.stringify(parsePayload(b));

async function measuredFetch(profile, input, init) {
  const url = new URL(typeof input === 'string' ? input : input.url ?? String(input));
  ensure(allowedFixtureRequest(input, init, config.url, id) || ((init?.method ?? 'GET') === 'GET' && url.origin === config.url && url.pathname === '/rest/v1/'), 'Request outside fixture scope.');
  const m = { profile, channel: 'node-sdk', path: url.pathname, method: init?.method ?? 'GET', at: new Date().toISOString(), http: null, sqlstate: null, elapsed_ms: null };
  if (url.pathname.startsWith('/rest/v1/rpc/')) m.expected_revision = JSON.parse(init.body).p_expected_revision;
  report.metrics.push(m); const start = performance.now();
  try {
    const r = await fetch(input, { ...init, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    m.http = r.status;
    const text = await r.text();
    if (!r.ok && url.pathname.startsWith('/rest/')) { try { m.sqlstate = code(JSON.parse(text).code); } catch {} }
    m.category = r.ok ? 'success' : m.sqlstate ? 'sql-or-postgrest' : 'http';
    return new Response(r.status === 204 ? null : text, { status: r.status, statusText: r.statusText, headers: r.headers });
  } catch (e) {
    m.category = e?.name === 'TimeoutError' ? 'transport-timeout' : 'transport';
    throw new Stop('RECETTE_TRANSPORT_FAILURE');
  } finally { m.elapsed_ms = Math.round((performance.now() - start) * 10) / 10; }
}
const save = (name, revision, payload) => clients[name].rpc('save_inspection_dossier', { p_id: id, p_expected_revision: revision, p_payload: payload });
const read = () => clients.ADMIN.from('inspection_dossiers').select('*').eq('id', id);
const remove = revision => clients.ADMIN.rpc('delete_inspection_dossier', { p_id: id, p_expected_revision: revision, p_confirmation: id });

async function curlStale(payload) {
  const m = { profile: 'AGENT_A', channel: 'curl-same-proxy', method: 'POST', path: '/rest/v1/rpc/save_inspection_dossier', expected_revision: 1, at: new Date().toISOString(), http: null, sqlstate: null };
  report.metrics.push(m); const start = performance.now();
  const q = JSON.stringify;
  // Secrets are passed on stdin, never in argv, command text, logs or a file.
  const configuration = [
    'silent', 'show-error', 'http1.1', 'max-time = 15', 'retry = 0', 'request = "POST"',
    'url = ' + q(config.url + m.path), 'header = ' + q('apikey: ' + config.publishableKey),
    'header = ' + q('Authorization: Bearer ' + tokens.AGENT_A), 'header = "Content-Type: application/json"',
    'data = ' + q(JSON.stringify({ p_id: id, p_expected_revision: 1, p_payload: payload })),
    'write-out = "\\n__RECETTE__%{http_code}"',
  ].join('\n');
  const child = spawn('curl', ['-q', '--config', '-'], { stdio: ['pipe', 'pipe', 'pipe'] });
  let stdout = ''; child.stdout.on('data', b => { stdout += b; }); child.stderr.resume();
  child.stdin.on('error', () => {}); child.stdin.end(configuration);
  const exitCode = await new Promise((yes, no) => { child.once('error', no); child.once('close', yes); });
  m.elapsed_ms = Math.round((performance.now() - start) * 10) / 10; m.curl_exit = exitCode;
  const marker = '\n__RECETTE__';
  const boundary = stdout.lastIndexOf(marker);
  m.http = boundary < 0 ? null : Number(stdout.slice(boundary + marker.length));
  let body; try { body = JSON.parse(boundary < 0 ? '' : stdout.slice(0, boundary)); } catch {}
  m.sqlstate = code(body?.code);
  m.category = exitCode !== 0 ? 'transport' : m.sqlstate ? 'sql-or-postgrest' : 'unexpected-response';
  return m;
}

await checkpoint(); console.log(JSON.stringify({ report: output, synthetic_id: id }));
try {
  for (const name of names) {
    const c = clients[name] = createClient(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, db: { retry: false }, global: { fetch: (i, n) => measuredFetch(name, i, n) } });
    const l = await c.auth.signInWithPassword({ email: process.env[`TEAM_TEST_${name}_EMAIL`], password: process.env[`TEAM_TEST_${name}_PASSWORD`] });
    mark('login_' + name, !l.error && l.data.session);
    tokens[name] = l.data.session.access_token;
    const v = await c.auth.getUser();
    const jwt = JSON.parse(Buffer.from(tokens[name].split('.')[1], 'base64url').toString());
    mark('identity_' + name, !v.error && v.data.user?.id === jwt.sub && jwt.iss === config.url + '/auth/v1' && v.data.user.email?.toLowerCase() === process.env[`TEAM_TEST_${name}_EMAIL`].trim().toLowerCase());
    subjects[name] = v.data.user.id;
  }
  mark('distinct_subjects', new Set(Object.values(subjects)).size === 5);
  for (const name of names) {
    const r = await clients.ADMIN.from('team_members').select('role,active').eq('user_id', subjects[name]);
    mark('membership_' + name, !r.error && (name === 'NO_MEMBER' ? r.data.length === 0 : r.data.length === 1 && r.data[0].role === (name === 'ADMIN' ? 'admin' : 'agent') && r.data[0].active === (name !== 'INACTIVE')));
  }
  // A read-only root inspection identifies the advertised PostgREST version.
  const root = await measuredFetch('AGENT_A', config.url + '/rest/v1/', { method: 'GET', headers: { apikey: config.publishableKey, authorization: 'Bearer ' + tokens.AGENT_A, accept: 'application/openapi+json' } });
  if (root.ok) { const schema = await root.json(); report.postgrest_version = String(schema.info?.version ?? 'unknown').slice(0, 100); }
  for (const prior of ['473fb7b4-b987-4291-b359-15e753ad5628', 'cd51b563-94ac-412a-b93c-3fbd818ee779']) {
    // Explicit GET only; these IDs are excluded from all mutation helpers.
    const r = await fetch(config.url + '/rest/v1/inspection_dossiers?' + new URLSearchParams({ select: 'id', id: 'eq.' + prior }), { headers: { apikey: config.publishableKey, authorization: 'Bearer ' + tokens.ADMIN }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    mark('prior_absent_' + prior, r.ok && (await r.json()).length === 0);
  }
  mark('new_uuid_absent', (await read()).data?.length === 0);
  const initial = createInitialPayload(); initial.data.reference = 'RECETTE-CONFLIT-' + id.slice(0, 8); initial.data.client = 'Donnée entièrement synthétique';
  initial.data['entry-notes'] = 'Accents éàç\n  espaces  '; initial.data.guests = '';
  const changed = structuredClone(initial); changed.data['exit-notes'] = 'Modification Agent B synthétique';
  attempted = true; await checkpoint();
  const first = await save('AGENT_A', 0, initial); mark('creation_revision_1', !first.error && first.data?.[0]?.revision === 1);
  const second = await save('AGENT_B', 1, changed); mark('normal_save_revision_2', !second.error && second.data?.[0]?.revision === 2);
  const stale = await save('AGENT_A', 1, initial);
  report.stale_sdk = { http: stale.status, sqlstate: code(stale.error?.code), category: stale.status === 0 ? 'transport-or-protocol' : stale.error?.code ? 'sql-or-postgrest' : 'unexpected' };
  const after = await read(); mark('revision_2_and_B_payload_preserved', !after.error && after.data?.[0]?.revision === 2 && same(after.data[0].payload, changed));
  mark('server_authors_preserved', after.data[0].created_by === subjects.AGENT_A && after.data[0].updated_by === subjects.AGENT_B);
  await checkpoint();
  // On failure, this same stale request is the only extra mutation-shaped call:
  // a focused transport comparison, not progression to another business test.
  report.stale_curl = await curlStale(initial); await checkpoint();
  const afterCurl = await read(); mark('after_curl_B_payload_preserved', !afterCurl.error && afterCurl.data?.[0]?.revision === 2 && same(afterCurl.data[0].payload, changed));
  mark('stale_sdk_business_conflict', stale.error?.code === expectedConflict);
  mark('stale_curl_business_conflict', report.stale_curl.sqlstate === expectedConflict);
  const repeated = await save('AGENT_A', 0, initial); mark('repeated_creation_deterministic_conflict', repeated.error?.code === expectedConflict);
  const afterRepeat = await read(); mark('repeat_did_not_change_or_duplicate_dossier', !afterRepeat.error && afterRepeat.data?.length === 1 && afterRepeat.data[0].revision === 2 && same(afterRepeat.data[0].payload, changed));
  const a = structuredClone(changed), b = structuredClone(changed); a.data.agent = 'Agent A synthétique'; b.data.agent = 'Agent B synthétique';
  const race = await Promise.all([save('AGENT_A', 2, a), save('AGENT_B', 2, b)]);
  const winner = race.findIndex(r => !r.error && r.data?.[0]?.revision === 3);
  mark('concurrency_one_winner_one_conflict', winner >= 0 && race.filter(r => !r.error).length === 1 && race.filter(r => r.error?.code === expectedConflict).length === 1);
  const final = await read(); mark('winning_payload_preserved', !final.error && final.data?.[0]?.revision === 3 && same(final.data[0].payload, winner === 0 ? a : b));
  report.success = true;
} catch (e) {
  report.failure = e instanceof Stop ? e.message : 'Unexpected failure; sensitive details suppressed.';
  console.log(JSON.stringify({ stopped: report.failure }));
} finally {
  if (attempted) {
    try {
      const r = await read(); ensure(!r.error, 'cleanup_read_failed');
      if (r.data.length) { const d = await remove(r.data[0].revision); ensure(!d.error && d.data === id, 'cleanup_receipt_failed'); }
      report.cleanup = [];
      for (const pause of [0, 5000, 25000]) {
        if (pause) await delay(pause);
        const r = await read(); const absent = !r.error && r.data?.length === 0;
        report.cleanup.push({ at: new Date().toISOString(), absent }); await checkpoint();
        if (!absent) { report.success = false; throw new Stop('cleanup_absence_not_confirmed'); }
      }
    } catch { report.success = false; report.cleanup_failure = 'Manual review required for this synthetic UUID only.'; }
  }
  for (const c of Object.values(clients)) {
    try { if ((await c.auth.signOut({ scope: 'local' })).error) { report.logout_unconfirmed = true; report.success = false; } }
    catch { report.logout_unconfirmed = true; report.success = false; }
  }
  await checkpoint(); console.log(JSON.stringify({ report: output, synthetic_id: id, success: report.success, failure: report.failure, cleanup: report.cleanup }));
}
if (!report.success) process.exitCode = 1;
