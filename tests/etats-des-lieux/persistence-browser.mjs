/** Local-only form/transport integration; intercepted API, no fake Auth provider. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { loadTs } from './load-typescript.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const { createInitialPayload } = loadTs('modules/etats-des-lieux/state.ts');
const { TEMPLATE_ID } = loadTs('modules/etats-des-lieux/persistence.ts');
if (process.env.NODE_ENV === 'production') throw new Error('Local tests only');
const root = resolve(import.meta.dirname, '../..');
const route = resolve(root, 'app/phase4-local-test');
await access(route).then(() => { throw new Error('Temporary route already exists'); }, () => {});
const fixture = createInitialPayload();
fixture.data = { reference: 'LC-TEST', client: 'Test éàç', arriving: '2026-11-05', leaving: '2026-11-08', guests: '', agent: 'Test',
  'entry-date': '2026-11-05T16:30', 'exit-date': '2026-11-08T09:30', 'entry-notes': 'Défaut existant\n\n  espaces  ', 'exit-notes': 'Sortie : éàç\nTexte' };
fixture.checks.entree = Array.from({ length: 13 }, (_, i) => [null, 'conforme', 'corriger'][i % 3]);
fixture.checks.sortie = [...fixture.checks.entree].reverse();
fixture.steps.entree[7] = true; fixture.steps.sortie[6] = true; fixture.steps.consignes[0] = true; fixture.accepted = true;
let child, browser;
try {
  await mkdir(route);
  await writeFile(resolve(route, 'page.tsx'), `"use client";
import {useEffect,useRef,useState} from "react";
import InspectionForm from "@/modules/etats-des-lieux/inspection-form";
import {createDossierStorage} from "@/modules/etats-des-lieux/dossier-storage";
import type {InspectionFormHandle} from "@/modules/etats-des-lieux/types";
declare global {interface Window {phase4Test:InspectionFormHandle}}
export default function LocalTest(){
 const ref=useRef<InspectionFormHandle>(null);
 const [storage]=useState(()=>createDossierStorage(null,id=>window.history.replaceState(null,"","/equipe/etats-des-lieux/"+id)));
 useEffect(()=>{window.phase4Test={getPayload:()=>ref.current!.getPayload(),replacePayload:p=>ref.current!.replacePayload(p)}},[]);
 return <InspectionForm ref={ref} storage={storage}/>;
}`);
  child = spawn(process.execPath, [resolve(root, 'node_modules/next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1', '--port', '3104'], { cwd: root, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = ''; for (const stream of [child.stdout, child.stderr]) stream.on('data', d => { logs += d; });
  for (let i = 0;; i++) {
    if (child.exitCode !== null) throw new Error(logs);
    try { if ((await fetch('http://127.0.0.1:3104/phase4-local-test')).ok) break; } catch {}
    if (i > 120) throw new Error(logs); await delay(250);
  }
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  let saved = null, id, revision = 0, mode = 'normal', pendingRoute;
  const requests = [];
  const receipt = () => ({ id, revision, updated_at: '2026-11-05T18:00:00Z' });
  await page.route('**/equipe/api/session?operation=inspection-export', route => route.fulfill(
    mode === 'unauthorized' ? { status: 401, json: { error: 'Denied' } } : { json: { role: 'agent', user_id: id } }
  ));
  await page.route('**/equipe/api/etats-des-lieux**', async route => {
    const req = route.request(), method = req.method(), body = req.postDataJSON();
    requests.push({ method, body });
    if (mode === 'defer') { pendingRoute = route; return; }
    if (mode === 'offline') { await route.abort(); return; }
    if (mode === 'unauthorized') { await route.fulfill({ status: 401, json: { error: 'Access denied' } }); return; }
    if (method === 'GET') { await route.fulfill({ json: { ...receipt(), template_id: TEMPLATE_ID, payload: saved } }); return; }
    if (body.revision !== revision) { await route.fulfill({ status: 409, json: { error: 'Conflict' } }); return; }
    saved = body.payload; revision++;
    await route.fulfill({ json: receipt() });
  });
  await page.goto('http://127.0.0.1:3104/phase4-local-test', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(window.phase4Test));
  const payload = () => page.evaluate(() => window.phase4Test.getPayload());
  const feedback = text => page.locator('#feedback').filter({ hasText: text }).waitFor();
  await page.locator('#load').click(); await feedback('Aucun brouillon trouvé'); assert.equal(requests.length, 0);
  await page.evaluate(p => window.phase4Test.replacePayload(p), fixture);
  assert.equal(requests.length, 0); // Filling does not autosave.
  mode = 'defer'; await page.locator('#save').evaluate(e => { e.click(); e.click(); });
  await page.waitForFunction(() => document.querySelector('#save').disabled);
  for (let i = 0; !pendingRoute && i < 50; i++) await delay(20);
  assert.ok(pendingRoute); assert.equal(requests.length, 1);
  assert.match(await page.locator('#feedback').textContent(), /en cours/);
  await page.locator('#client').fill('Saisie pendant la sauvegarde');
  const request = requests[0]; id = request.body.id; saved = request.body.payload; revision = 1;
  await pendingRoute.fulfill({ status: 201, json: receipt() }); mode = 'normal';
  await feedback('restent à sauvegarder');
  assert.equal(await page.locator('#client').inputValue(), 'Saisie pendant la sauvegarde');
  assert.ok(page.url().endsWith('/equipe/etats-des-lieux/' + id));
  await page.locator('#save').click(); await feedback('révision 2');
  assert.equal(requests.at(-1).body.revision, 1); assert.deepEqual(saved, await payload());
  revision = 3; saved = structuredClone(fixture); saved.data.reference = 'Autre agent';
  const local = await payload(); await page.locator('#save').click(); await feedback('Conflit');
  assert.deepEqual(await payload(), local);
  page.once('dialog', d => d.dismiss()); await page.locator('#load').click(); await feedback('annulé');
  assert.deepEqual(await payload(), local);
  await page.locator('#save').click(); await feedback('Conflit'); assert.equal(requests.at(-1).body.revision, 2);
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#json').click()]);
  assert.equal(download.suggestedFilename(), 'etat-des-lieux-domaine-lo-carmalhon.json');
  const stream = await download.createReadStream(); let json = ''; for await (const part of stream) json += part;
  assert.deepEqual(JSON.parse(json), local); assert.equal(json, JSON.stringify(local, null, 2));
  page.once('dialog', d => d.accept()); await page.locator('#load').click(); await feedback('restauré');
  assert.deepEqual(await payload(), saved);
  await page.locator('#save').click(); await feedback('révision 4'); assert.equal(requests.at(-1).body.revision, 3);
  const count = requests.length;
  page.once('dialog', d => d.dismiss()); await page.locator('#reset').click(); assert.deepEqual(await payload(), saved);
  page.once('dialog', d => d.accept()); await page.locator('#reset').click(); await feedback('réinitialisé');
  assert.deepEqual(await payload(), createInitialPayload()); assert.equal(requests.length, count);
  page.once('dialog', d => d.accept()); await page.locator('#load').click(); await feedback('restauré'); assert.deepEqual(await payload(), saved);
  page.once('dialog', d => d.accept()); await page.locator('#reset').click();
  await page.locator('#save').click(); await feedback('révision 5'); assert.deepEqual(saved, createInitialPayload());
  await page.locator('#client').fill('À conserver');
  for (const failure of ['unauthorized', 'offline']) {
    mode = failure; await page.locator('#save').click(); await feedback(failure === 'unauthorized' ? 'Session expirée' : 'Connexion interrompue');
    assert.equal(await page.locator('#client').inputValue(), 'À conserver');
  }
  await page.evaluate(() => { window.print = () => { document.body.dataset.printed = document.querySelector('#feedback').hidden ? 'yes' : 'status-printed'; }; });
  mode = 'unauthorized'; await page.locator('#print').click(); await feedback('Session expirée');
  assert.equal(await page.locator('body').getAttribute('data-printed'), null);
  mode = 'normal'; await page.locator('#print').click(); await page.waitForFunction(() => document.body.dataset.printed === 'yes');
  await page.emulateMedia({ media: 'print' });
  for (const phase of ['entree', 'sortie']) assert.equal(await page.locator('#phase-' + phase).isVisible(), true);
  await page.emulateMedia({ media: 'screen' });
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }
  assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
  assert.deepEqual(errors, []);
  console.log('Local browser persistence: confirmed save, pending edits, duplicate clicks, conflict, reload cancellation/acceptance, reset without deletion, unchanged export, session/network failure, print and responsive PASS. API intercepted; Supabase NOT tested.');
} finally {
  if (browser) await browser.close();
  if (child?.pid) { try { process.kill(-child.pid, 'SIGTERM'); } catch {} await new Promise(yes => { if (child.exitCode !== null) return yes(); child.once('exit', yes); }); }
  await rm(route, { recursive: true, force: true });
  await rm(resolve(root, '.next/dev'), { recursive: true, force: true });
}
