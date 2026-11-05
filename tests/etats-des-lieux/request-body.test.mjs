import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-typescript.mjs';
const { readInspectionJson } = loadTs('lib/inspections/request-body.ts');
const request = (body, type = 'application/json') => new Request('https://local.example.test/equipe/api/etats-des-lieux', {
  method: 'POST', headers: type === null ? {} : { 'Content-Type': type }, body,
  ...(body instanceof ReadableStream ? { duplex: 'half' } : {}),
});
const rejectedWith = status => error => error.status === status;

test('JSON transport preserves accents, whitespace and local dates without coercion', async () => {
  const value = { text: 'Éàç\n  texte  ', date: '2026-11-05T16:30', empty: '' };
  assert.deepEqual(await readInspectionJson(request(JSON.stringify(value), 'Application/JSON; charset=utf-8')), value);
});
test('wrong media type, missing body, malformed JSON and invalid UTF-8 fail closed', async () => {
  for (const type of [null, 'text/plain', 'application/x-www-form-urlencoded']) {
    await assert.rejects(readInspectionJson(request('{}', type)), rejectedWith(415));
  }
  await assert.rejects(readInspectionJson(request(null)), rejectedWith(400));
  await assert.rejects(readInspectionJson(request('{')), rejectedWith(400));
  await assert.rejects(readInspectionJson(request(new Uint8Array([0xc3, 0x28]))), rejectedWith(400));
});
test('exactly 1 MiB of UTF-8 JSON is accepted and one additional byte is rejected', async () => {
  const text = 'x'.repeat(1_048_574);
  assert.equal((await readInspectionJson(request(JSON.stringify(text)))).length, text.length);
  await assert.rejects(readInspectionJson(request(JSON.stringify(text + 'x'))), rejectedWith(413));
});
test('streamed bodies without Content-Length are bounded and their source is cancelled', async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) { controller.enqueue(new Uint8Array(600_000)); },
    cancel() { cancelled = true; },
  });
  const req = request(stream);
  assert.equal(req.headers.has('Content-Length'), false);
  await assert.rejects(readInspectionJson(req), rejectedWith(413));
  assert.equal(cancelled, true);
});
