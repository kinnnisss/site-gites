import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const loadModule = createRequire(import.meta.url);
const ts = loadModule('typescript');
async function loadPureModule(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } });
  return import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
}
const { can, isActiveMember, permissions } = await loadPureModule('../../lib/auth/policy.ts');
const { readSupabaseConfig, recoveryOrigin } = await loadPureModule('../../lib/supabase/config.ts');
const { inspectionFeatureEnabled } = await loadPureModule('../../lib/inspections/feature.ts');
const id = '00000000-0000-4000-8000-000000000001';
// These fixtures test only pure policy decisions, never an Auth server/session.
for (const role of ['agent', 'admin']) {
  for (const permission of permissions) {
    test(`authorization policy: active ${role}, ${permission}`, () => {
      const member = { user_id: id, role, active: true };
      assert.equal(isActiveMember(id, member), true);
      assert.equal(can(member, permission), role === 'admin' || !['delete_dossier', 'manage_team'].includes(permission));
    });
  }
  test(`authorization policy: inactive ${role} denied for every operation`, () => {
    const member = { user_id: id, role, active: false };
    assert.equal(isActiveMember(id, member), false);
    for (const permission of permissions) assert.equal(can(member, permission), false);
  });
}
test('anonymous, missing member, mismatched identity and unknown role are denied', () => {
  assert.equal(isActiveMember(null, { user_id: id, role: 'admin', active: true }), false);
  assert.equal(isActiveMember(id, null), false);
  assert.equal(isActiveMember('other-id', { user_id: id, role: 'admin', active: true }), false);
  assert.equal(isActiveMember(id, { user_id: id, role: 'owner', active: true }), false);
});
test('client role fields are not an escalation path and unknown permissions are denied', () => {
  const member = { user_id: id, role: 'agent', active: true, user_metadata: { role: 'admin' } };
  assert.equal(can(member, 'manage_team'), false);
  assert.equal(can(member, 'delete_dossier'), false);
  assert.equal(can(member, 'unknown'), false);
});
test('revocation is reevaluated on the next decision, without a role cache', () => {
  const member = { user_id: id, role: 'admin', active: true };
  assert.equal(can(member, 'manage_team'), true);
  member.active = false;
  assert.equal(can(member, 'manage_team'), false);
});
test('configuration absent or invalid never enables authentication', () => {
  for (const env of [{}, { NEXT_PUBLIC_SUPABASE_URL: 'not-a-url' },
    { NEXT_PUBLIC_SUPABASE_URL: 'http://development.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example' },
    { NEXT_PUBLIC_SUPABASE_URL: 'https://development.supabase.co/path', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example' }]) {
    assert.equal(readSupabaseConfig(env), null);
  }
});
test('secret/service-role keys cannot be accepted as public configuration', () => {
  for (const key of ['sb_secret_placeholder', 'service_role', 'eyJ.placeholder.jwt']) {
    assert.equal(readSupabaseConfig({ NEXT_PUBLIC_SUPABASE_URL: 'https://development.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key }), null);
  }
});
test('development publishable configuration is accepted, without logging values', () => {
  assert.ok(readSupabaseConfig({ NEXT_PUBLIC_SUPABASE_URL: 'https://development.supabase.co/', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example' }));
});
test('recovery origin rejects insecure remote origins, paths and redirect injection', () => {
  for (const value of [undefined, 'javascript:alert(1)', 'http://remote.example', 'https://example.test/path', 'https://user:password@example.test', 'https://example.test/?next=https://evil.test']) {
    assert.equal(recoveryOrigin(value), null);
  }
  assert.equal(recoveryOrigin('http://localhost:3000'), 'http://localhost:3000');
  assert.equal(recoveryOrigin('https://preview.example.test'), 'https://preview.example.test');
});
const { hasSameOrigin } = await loadPureModule('../../lib/auth/request-origin.ts');
test('same-origin API requests accept the actual loopback Host without aliases',()=>{
  assert.equal(hasSameOrigin('http://127.0.0.1:3000','127.0.0.1:3000','http:'),true);
  assert.equal(hasSameOrigin('http://localhost:3000','localhost:3000','http:'),true);
  assert.equal(hasSameOrigin('http://localhost:3000','127.0.0.1:3000','http:'),false);
});
test('API mutations reject missing or cross-site Origin and changed ports/schemes',()=>{
  assert.equal(hasSameOrigin(null,'example.test','https:'),false);
  assert.equal(hasSameOrigin('https://untrusted.example','example.test','https:'),false);
  assert.equal(hasSameOrigin('http://example.test','example.test','https:'),false);
  assert.equal(hasSameOrigin('https://example.test:444','example.test','https:'),false);
});
test('inspection availability is closed by default and accepts only the exact opt-in', () => {
  for (const flag of [undefined, '', 'false', 'TRUE', '1']) {
    for (const target of [undefined, 'development', 'preview', 'production']) {
      assert.equal(inspectionFeatureEnabled({ TEAM_INSPECTIONS_ENABLED: flag, VERCEL_ENV: target }), false);
    }
  }
  assert.equal(inspectionFeatureEnabled({ TEAM_INSPECTIONS_ENABLED: 'true' }), true);
  assert.equal(inspectionFeatureEnabled({ TEAM_INSPECTIONS_ENABLED: 'true', VERCEL_ENV: 'preview' }), true);
});
test('the production lock wins over an explicit inspection opt-in', () => {
  assert.equal(inspectionFeatureEnabled({ TEAM_INSPECTIONS_ENABLED: 'true', VERCEL_ENV: 'production' }), false);
});
