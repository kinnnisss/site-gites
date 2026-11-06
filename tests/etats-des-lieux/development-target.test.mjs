import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesDevelopmentProject, allowedFixtureRequest } from './development-target.mjs';

test('development pin accepts a reference or its exact Supabase hostname', () => {
  for (const expected of ['fixture123', 'fixture123.supabase.co', ' fixture123.supabase.co ']) {
    assert.equal(matchesDevelopmentProject('https://fixture123.supabase.co', expected), true);
  }
});

test('manual suite permits only the current synthetic UUID and local sign-out', () => {
  const origin = 'https://fixture123.supabase.co', id = '00000000-0000-4000-8000-000000000001';
  const allowed = (path, method, body) => allowedFixtureRequest(origin + path, { method, body: JSON.stringify(body) }, origin, id);
  assert.equal(allowed('/rest/v1/rpc/save_inspection_dossier', 'POST', { p_id: id }), true);
  assert.equal(allowed('/rest/v1/inspection_dossiers?id=eq.' + id, 'DELETE'), true);
  assert.equal(allowed('/auth/v1/logout?scope=local', 'POST'), true);
  for (const [path, method, body] of [
    ['/rest/v1/rpc/save_inspection_dossier', 'POST', { p_id: 'other' }],
    ['/rest/v1/inspection_dossiers', 'DELETE'], ['/rest/v1/team_members', 'PATCH', { role: 'admin' }],
    ['/auth/v1/signup', 'POST'], ['/auth/v1/logout?scope=global', 'POST'],
  ]) assert.equal(allowed(path, method, body), false);
  assert.equal(allowedFixtureRequest('https://other.supabase.co/auth/v1/user', {}, origin, id), false);
});

test('development pin fails closed for other projects and ambiguous destinations', () => {
  for (const url of ['https://other.supabase.co', 'http://fixture123.supabase.co',
    'https://fixture123.supabase.co.attacker.example', 'https://fixture123.supabase.co:444',
    'https://user@fixture123.supabase.co', 'https://fixture123.supabase.co/path',
    'https://fixture123.supabase.co?query=1', 'https://fixture123.supabase.co#hash', 'invalid']) {
    assert.equal(matchesDevelopmentProject(url, 'fixture123'), false);
  }
  for (const expected of [undefined, '', 'https://fixture123.supabase.co', '*.supabase.co',
    'fixture123.supabase.co.attacker.example', 'fixture123.supabase.co.supabase.co']) {
    assert.equal(matchesDevelopmentProject('https://fixture123.supabase.co', expected), false);
  }
});
