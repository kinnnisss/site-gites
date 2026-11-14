/** One explicitly authorized synthetic dossier on the owner's designated production database. */
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile, rename } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { loadTs } from './load-typescript.mjs';
import { matchesDevelopmentProject as matchesProject, allowedFixtureRequest } from './development-target.mjs';
const { readSupabaseConfig } = loadTs('lib/supabase/config.ts');
const { createInitialPayload } = loadTs('modules/etats-des-lieux/state.ts');
const { parsePayload } = loadTs('modules/etats-des-lieux/persistence.ts');
class SafeFailure extends Error {}
const ensure = (value, label) => { if (!value) throw new SafeFailure(label); };
const id = randomUUID();
const report = { started_at: new Date().toISOString(), mode: 'one-production-synthetic-dossier', synthetic_id: id, metrics: [], checks: [], success: false, business_write_attempted: false };
const clients = {}, subjects = {};
let output;
const checkpoint = async () => { if (!output) return; await writeFile(output + '.tmp', JSON.stringify(report, null, 2) + '\n', { mode: 0o600 }); await rename(output + '.tmp', output); };
const check = (ok, label) => { report.checks.push({ label, passed: Boolean(ok) }); ensure(ok, label); };
const same = (a, b) => JSON.stringify(parsePayload(a)) === JSON.stringify(parsePayload(b));
let config;
async function measuredFetch(profile, input, init) {
  const u = new URL(typeof input === 'string' ? input : input.url ?? String(input));
  const method = (init?.method ?? 'GET').toUpperCase();
  ensure(method !== 'DELETE' && allowedFixtureRequest(input, init, config.url, id), 'request_outside_single_fixture_scope');
  const metric = { profile, path: u.pathname, method, at: new Date().toISOString(), http: null, sqlstate: null, elapsed_ms: null };
  report.metrics.push(metric); const start = performance.now();
  try {
    const r = await fetch(input, { ...init, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    metric.http = r.status; const body = await r.text();
    if (!r.ok && u.pathname.startsWith('/rest/')) {
      try { const code = JSON.parse(body).code; if (/^[A-Za-z0-9_]{1,32}$/.test(code)) metric.sqlstate = code; } catch {}
    }
    metric.category = r.ok ? 'success' : metric.sqlstate ? 'sql-or-postgrest' : 'http';
    return new Response(r.status === 204 ? null : body, { status: r.status, statusText: r.statusText, headers: r.headers });
  } catch (e) { metric.category = e?.name === 'TimeoutError' ? 'transport-timeout' : 'transport-or-protocol'; throw new SafeFailure('request_transport_failure'); }
  finally { metric.elapsed_ms = Math.round((performance.now() - start) * 10) / 10; await checkpoint(); }
}
const read = () => clients.ADMIN.from('inspection_dossiers').select('*').eq('id', id);
const save = (revision, payload) => clients.AGENT_A.rpc('save_inspection_dossier', { p_id: id, p_expected_revision: revision, p_payload: payload });
try {
  ensure(process.argv.includes('--allow-production-synthetic-write'), 'explicit_production_synthetic_write_authorization_required');
  ensure(execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim() === 'fix/activation-espace-equipe-production', 'activation_branch_required');
  config = readSupabaseConfig(process.env);
  // No inferred target and no fallback to the development test pin.
  ensure(config && matchesProject(config.url, process.env.TEAM_PRODUCTION_EXPECTED_PROJECT_REF), 'owner_designated_production_project_required');
  ensure(['ADMIN', 'AGENT_A'].every(n => process.env[`TEAM_TEST_${n}_EMAIL`] && process.env[`TEAM_TEST_${n}_PASSWORD`]), 'dedicated_existing_test_credentials_required');
  ensure(process.env.TEAM_TEST_ADMIN_EMAIL.trim().toLowerCase() !== process.env.TEAM_TEST_AGENT_A_EMAIL.trim().toLowerCase(), 'distinct_test_accounts_required');
  report.project_ref = new URL(config.url).hostname.split('.')[0];
  await mkdir('/tmp/site-gites-production-smoke', { recursive: true, mode: 0o700 });
  output = '/tmp/site-gites-production-smoke/run-' + Date.now() + '.json';
  await checkpoint(); console.log(JSON.stringify({ report: output, synthetic_id: id }));
  for (const name of ['ADMIN', 'AGENT_A']) {
    const c = clients[name] = createClient(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, db: { retry: false }, global: { fetch: (i, n) => measuredFetch(name, i, n) } });
    const login = await c.auth.signInWithPassword({ email: process.env[`TEAM_TEST_${name}_EMAIL`], password: process.env[`TEAM_TEST_${name}_PASSWORD`] });
    check(!login.error && login.data.session, 'fixture_login_' + name);
    const verified = await c.auth.getUser();
    const claims = JSON.parse(Buffer.from(login.data.session.access_token.split('.')[1], 'base64url').toString());
    check(!verified.error && verified.data.user?.email?.toLowerCase() === process.env[`TEAM_TEST_${name}_EMAIL`].trim().toLowerCase() && claims.sub === verified.data.user.id && claims.iss === config.url + '/auth/v1', 'fixture_identity_' + name);
    subjects[name] = verified.data.user.id;
    const membership = await c.from('team_members').select('role,active').eq('user_id', subjects[name]);
    check(!membership.error && membership.data.length === 1 && membership.data[0].active && membership.data[0].role === (name === 'ADMIN' ? 'admin' : 'agent'), 'fixture_membership_' + name);
  }
  check(subjects.ADMIN !== subjects.AGENT_A, 'distinct_verified_subjects');
  const absent = await read(); check(!absent.error && absent.data.length === 0, 'synthetic_uuid_absent');
  const initial = createInitialPayload(); initial.data.reference = 'LIVRAISON-TEST-' + id.slice(0, 8);
  initial.data.client = 'Donnée entièrement synthétique'; initial.data['entry-notes'] = 'Test de livraison éàç\n  espaces  ';
  initial.steps.consignes[0] = true; initial.checks.entree[0] = 'conforme';
  report.business_write_attempted = true; await checkpoint();
  const first = await save(0, initial); check(first.status === 200 && !first.error && first.data?.[0]?.id === id && first.data[0].revision === 1, 'create_revision_1');
  const changed = structuredClone(initial); changed.data['exit-notes'] = 'Modification synthétique sauvegardée';
  const second = await save(1, changed); check(second.status === 200 && !second.error && second.data?.[0]?.id === id && second.data[0].revision === 2, 'save_revision_2');
  const restored = await read(); check(!restored.error && restored.data.length === 1 && restored.data[0].revision === 2 && same(restored.data[0].payload, changed), 'reload_exact_payload');
  check(restored.data[0].created_by === subjects.AGENT_A && restored.data[0].updated_by === subjects.AGENT_A, 'server_authors_verified');
  const agentDelete = await clients.AGENT_A.rpc('delete_inspection_dossier', { p_id: id, p_expected_revision: 2, p_confirmation: id });
  check(agentDelete.status === 403 && agentDelete.error?.code === '42501', 'agent_delete_denied');
  const stale = await save(1, initial); check(stale.status === 409 && stale.error?.code === 'PT409', 'stale_revision_http_409_pt409');
  const preserved = await read(); check(!preserved.error && preserved.data.length === 1 && preserved.data[0].revision === 2 && same(preserved.data[0].payload, changed), 'payload_preserved_after_conflict');
  report.success = true;
} catch (e) {
  report.failure = e instanceof SafeFailure ? e.message : 'unexpected_failure_details_suppressed';
} finally {
  if (report.business_write_attempted) {
    report.cleanup = [];
    try {
      const current = await read(); ensure(!current.error, 'cleanup_read_failed');
      if (current.data.length) {
        ensure(current.data.length === 1 && current.data[0].id === id && current.data[0].created_by === subjects.AGENT_A, 'cleanup_fixture_ownership_not_confirmed');
        const deleted = await clients.ADMIN.rpc('delete_inspection_dossier', { p_id: id, p_expected_revision: current.data[0].revision, p_confirmation: id });
        ensure(!deleted.error && deleted.data === id, 'cleanup_receipt_failed');
      }
      for (const pause of [0, 5000, 25000]) {
        if (pause) await delay(pause);
        const r = await read(); const absent = !r.error && r.data.length === 0;
        report.cleanup.push({ at: new Date().toISOString(), absent }); await checkpoint();
        ensure(absent, 'delayed_cleanup_absence_not_confirmed');
      }
    } catch (e) { report.success = false; report.cleanup_failure = e instanceof SafeFailure ? e.message : 'cleanup_failure_details_suppressed'; }
  }
  report.sessions_closed = true;
  for (const c of Object.values(clients)) {
    try { if ((await c.auth.signOut({ scope: 'local' })).error) report.sessions_closed = false; }
    catch { report.sessions_closed = false; }
  }
  report.success = report.success && report.sessions_closed;
  report.finished_at = new Date().toISOString(); await checkpoint();
  console.log(JSON.stringify({ success: report.success, report: output ?? null, synthetic_id: report.business_write_attempted ? id : null, failure: report.failure ?? report.cleanup_failure ?? null }));
  if (!report.success) process.exitCode = 1;
}
