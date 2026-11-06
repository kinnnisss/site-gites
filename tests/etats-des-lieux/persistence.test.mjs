import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-typescript.mjs';
const { createInitialPayload, copyPayload, inspectionReducer } = loadTs('modules/etats-des-lieux/state.ts');
const { parsePayload, parseDossier, TEMPLATE_ID, validRevision, databaseError } = loadTs('modules/etats-des-lieux/persistence.ts');
const { createDossierStorage } = loadTs('modules/etats-des-lieux/dossier-storage.ts');
const id = '00000000-0000-4000-8000-000000000001';
const receipt = revision => ({ id, revision, updated_at: '2026-11-05T18:00:00Z' });
const dossier = revision => ({ ...receipt(revision), template_id: TEMPLATE_ID, payload: createInitialPayload() });
const respond = (value, status = 200) => new Response(JSON.stringify(value), { status });

test('business conflict is HTTP 409 while transport failures remain unavailable', () => {
  assert.equal(databaseError('PT409').status, 409);
  assert.match(databaseError('PT409').message, /Vos saisies sont conservées/);
  assert.equal(databaseError('40001').status, 409); // Mixed-version rollout remains readable.
  assert.equal(databaseError('').status, 503);
  assert.equal(databaseError(undefined).status, 503);
});

test('payload round-trip keeps empty drafts, local dates, strings, accents, newlines and array order', () => {
  const payload = createInitialPayload();
  payload.data.guests = ''; payload.data['entry-notes'] = 'éàç\n\n  texte  ';
  payload.data.arriving = '2026-11-05'; payload.data['entry-date'] = '2026-11-05T16:30';
  payload.checks.entree = Array.from({ length: 13 }, (_, i) => [null, 'conforme', 'corriger'][i % 3]);
  payload.steps.consignes[7] = true;
  assert.deepEqual(parsePayload(JSON.parse(JSON.stringify(payload))), payload);
  const copy = copyPayload(payload); copy.data.client = 'changed';
  assert.notEqual(copy.data.client, payload.data.client);
  const reordered = Object.fromEntries(Object.entries(payload).reverse());
  reordered.data = Object.fromEntries(Object.entries(payload.data).reverse());
  assert.equal(JSON.stringify(parsePayload(reordered)), JSON.stringify(payload));
});
test('malformed and additional transport fields are rejected, with no completion requirement', () => {
  for (const mutate of [p => p.version = 2, p => p.extra = true, p => delete p.data.agent,
    p => p.data.guests = 6, p => p.checks.entree.pop(), p => p.checks.sortie[0] = 'yes',
    p => p.steps.sortie[0] = 'false', p => p.steps.consignes.push(false), p => p.accepted = null]) {
    const p = createInitialPayload(); mutate(p); assert.throws(() => parsePayload(p));
  }
  for (const p of [null, [], false, {}, 'text']) assert.throws(() => parsePayload(p));
  assert.deepEqual(parsePayload(createInitialPayload()), createInitialPayload());
  assert.equal(validRevision(0), false); assert.equal(validRevision('3'), false);
});
test('Effacer resets memory without mutating the saved payload', () => {
  const saved = createInitialPayload(); saved.data.client = 'Test';
  assert.deepEqual(inspectionReducer(saved, { type: 'reset' }), createInitialPayload());
  assert.equal(saved.data.client, 'Test');
});
test('unsupported template is rejected rather than reinterpreting its arrays', () => {
  assert.throws(() => parseDossier({ ...dossier(3), template_id: 'another-version' }));
});
test('new unsaved dossier has no invented draft and no network write', async () => {
  const fetchBefore = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('No request expected'); };
  try { assert.equal(await createDossierStorage(null, () => {}).load(), null); }
  finally { globalThis.fetch = fetchBefore; }
});
test('create waits for a real receipt, retains UUID and only advances revision on success', async () => {
  const original = globalThis.fetch; const calls = []; let created = 0;
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body); calls.push({ url, body, method: init.method });
    return respond({ id: body.id ?? calls[0].body.id, revision: calls.length, updated_at: receipt(1).updated_at }, calls.length === 1 ? 201 : 200);
  };
  try {
    const storage = createDossierStorage(null, () => { created++; });
    await storage.save(createInitialPayload()); await storage.save(createInitialPayload());
    assert.equal(created, 1); assert.equal(calls[0].method, 'POST');
    assert.equal(calls[1].method, 'PATCH'); assert.equal(calls[1].body.revision, 1);
    assert.equal(calls[1].url, '/equipe/api/etats-des-lieux/' + calls[0].body.id);
    assert.deepEqual(Object.keys(calls[0].body.payload), ['version', 'data', 'checks', 'steps', 'accepted']);
  } finally { globalThis.fetch = original; }
});
test('failed creation keeps the same UUID on retry, without declaring success', async () => {
  const original = globalThis.fetch; const ids = []; let created = false;
  globalThis.fetch = async (_url, init) => { ids.push(JSON.parse(init.body).id); throw new Error('offline'); };
  try {
    const storage = createDossierStorage(null, () => { created = true; });
    await assert.rejects(storage.save(createInitialPayload()));
    await assert.rejects(storage.save(createInitialPayload()));
    assert.equal(ids[0], ids[1]); assert.equal(created, false);
  } finally { globalThis.fetch = original; }
});
test('cancelled reload never advances the expected revision; accepted reload does', async () => {
  const original = globalThis.fetch; const revisions = [];
  globalThis.fetch = async (_url, init) => {
    if (!init?.method) return respond(dossier(4));
    revisions.push(JSON.parse(init.body).revision);
    return revisions.length === 1 ? respond({}, 409) : respond(receipt(5));
  };
  try {
    const storage = createDossierStorage(dossier(3), () => {});
    await storage.load(); // Cancel: acceptLoad is deliberately not called.
    await assert.rejects(storage.save(createInitialPayload()), e => e.status === 409);
    await storage.load(); storage.acceptLoad();
    await storage.save(createInitialPayload());
    assert.deepEqual(revisions, [3, 4]);
  } finally { globalThis.fetch = original; }
});
test('conflict, malformed receipt, forbidden session and outage retain the last acknowledged revision', async () => {
  const original = globalThis.fetch;
  for (const reply of [() => respond({}, 409), () => respond({}, 401), () => respond({}, 403),
    () => respond({}, 503), () => respond({ ...receipt(4), id: 'invalid' }),
    () => respond(receipt(8)), () => { throw new Error('network'); }]) {
    let calls = 0;
    globalThis.fetch = async (_url, init) => {
      assert.equal(JSON.parse(init.body).revision, 3);
      return calls++ === 0 ? reply() : respond(receipt(4));
    };
    const storage = createDossierStorage(dossier(3), () => {});
    await assert.rejects(storage.save(createInitialPayload()));
    await storage.save(createInitialPayload());
  }
  globalThis.fetch = original;
});
