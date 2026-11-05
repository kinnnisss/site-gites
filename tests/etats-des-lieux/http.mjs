/** Real Next HTTP boundary, no credentials or remote writes. */
import assert from 'node:assert/strict';
const base = process.env.TEAM_TEST_BASE_URL || 'http://127.0.0.1:3000';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
const id = '00000000-0000-4000-8000-000000000001';
const root = '/equipe/api/etats-des-lieux';
const denied = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? 401 : 503;
let checks = 0;
for (const [path, method] of [[root, 'POST'], [root + '/' + id, 'GET'], [root + '/' + id, 'PATCH'], [root + '/' + id, 'DELETE']]) {
  const response = await fetch(base + path, {
    method, redirect: 'manual', headers: { origin: base, 'content-type': 'application/json',
      'x-team-role': 'admin', cookie: 'role=admin;active=true' },
    ...(method === 'GET' ? {} : { body: JSON.stringify({ role: 'admin', confirmation: id }) }),
  });
  assert.equal(response.status, denied); assert.match(response.headers.get('cache-control'), /no-store/);
  assert.deepEqual(Object.keys(await response.json()), ['error']); checks++;
  if (method !== 'GET') {
    for (const origin of [undefined, 'https://untrusted.example']) {
      const r = await fetch(base + path, { method, headers: origin ? { origin } : {}, body: '{}' });
      assert.equal(r.status, 403); checks++;
    }
  }
}
for (const path of ['/equipe/etats-des-lieux', '/equipe/etats-des-lieux/nouveau', '/equipe/etats-des-lieux/' + id]) {
  const r = await fetch(base + path, { redirect: 'manual' });
  assert.equal(r.status, 307); assert.match(r.headers.get('location'), /^\/equipe\/connexion/); checks++;
}
for (const path of ['/phase2-local-test', '/phase4-local-test', '/docs/references/Domaine_Lo_Carmalhon_Demo_Etat_des_lieux.html']) {
  assert.equal((await fetch(base + path)).status, 404); checks++;
}
assert.equal((await fetch(base + '/equipe/api/session?operation=inspection-export')).status, denied); checks++;
console.log(`${checks} local HTTP authorization/origin/exposure checks passed. No Supabase authentication or remote RLS tested.`);
