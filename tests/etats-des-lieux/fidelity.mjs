/** Local-only browser comparison. Creates a temporary route and removes it in finally. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, rm, access } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

if (process.env.NODE_ENV === 'production') throw new Error('Local tests only.');
const loadModule = createRequire(import.meta.url);
const { chromium } = loadModule(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const root = resolve(import.meta.dirname, '../..');
const artifacts = resolve(process.env.PHASE2_ARTIFACTS || '/tmp/site-gites-phase2', `run-${Date.now()}`);
console.log('Artifacts: '+artifacts);
const route = resolve(root, 'app/phase2-local-test');
const reference = await readFile(resolve(root, 'docs/references/Domaine_Lo_Carmalhon_Demo_Etat_des_lieux.html'));
assert.equal(createHash('sha256').update(reference).digest('hex'), '9b368972d39ac663deb4ae88a9c29c767e956032b8603ac061dae875e30b10f0');
await mkdir(artifacts, { recursive: true });
await access(route).then(() => { throw new Error('Temporary route already exists; refusing to overwrite.'); }, () => {});
const fixture = {
  version: 1,
  data: { reference: 'LC-TEST-2026', client: 'Voyageur de test', arriving: '2026-11-07', leaving: '2026-11-14', guests: '4', agent: 'Agent de test', 'entry-date': '2026-11-07T16:30', 'exit-date': '2026-11-14T09:45', 'entry-notes': 'Observation de test : accents éàç, <texte> & ponctuation.\n' + 'Description longue sans données réelles. '.repeat(12), 'exit-notes': 'Anomalie de test uniquement.\n' + 'Écart à vérifier. '.repeat(20) },
  checks: { entree: Array.from({length:13}, (_,i)=>[null,'conforme','corriger'][i%3]), sortie: Array.from({length:13}, (_,i)=>['corriger',null,'conforme'][i%3]) },
  steps: { entree: Array.from({length:8},(_,i)=>i%2===0), sortie: Array.from({length:7},(_,i)=>i%2!==0), consignes: Array.from({length:8},(_,i)=>i%3===0) }, accepted: true,
};
const harness = `"use client";
import {useEffect,useRef,useState} from "react";
import InspectionForm from "@/modules/etats-des-lieux/inspection-form";
import type {InspectionFormHandle,InspectionPayload} from "@/modules/etats-des-lieux/types";
declare global { interface Window { inspectionTest: InspectionFormHandle & {mountPayload:(p:InspectionPayload)=>void} } }
export default function LocalTest(){
 const ref=useRef<InspectionFormHandle>(null);
 const [initial,setInitial]=useState<InspectionPayload>(); const [key,setKey]=useState(0);
 useEffect(()=>{window.inspectionTest={getPayload:()=>ref.current!.getPayload(),replacePayload:p=>ref.current!.replacePayload(p),mountPayload:p=>{setInitial(p);setKey(k=>k+1)}}},[]);
 return <InspectionForm key={key} ref={ref} initialPayload={initial}/>;
}`;
let child, browser, server;
const failures=[];
try {
  await mkdir(route); await writeFile(resolve(route, 'page.tsx'), harness);
  server = createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(reference)});
  await new Promise((yes,no)=>{server.once('error',no);server.listen(3101,'127.0.0.1',yes)});
  child=spawn(process.execPath,[resolve(root,'node_modules/next/dist/bin/next'),'dev','--hostname','127.0.0.1','--port','3100'],{cwd:root,detached:true,stdio:['ignore','pipe','pipe']});
  let logs=''; for(const stream of [child.stdout,child.stderr])stream.on('data',d=>{logs+=d;});
  for(let i=0;;i++){
    if(child.exitCode!==null)throw new Error(logs);
    try {const r=await fetch('http://127.0.0.1:3100/phase2-local-test');if(r.ok)break;}catch{}
    if(i===120)throw new Error('Local dev server not ready: '+logs);await delay(500);
  }
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:1080,height:900},deviceScaleFactor:1,locale:'fr-FR',colorScheme:'light'});
  const original=await context.newPage(), react=await context.newPage();
  for(const page of [original,react])page.on('pageerror',e=>failures.push(e.message));
  await original.goto('http://127.0.0.1:3101/',{waitUntil:'networkidle'});
  await react.goto('http://127.0.0.1:3100/phase2-local-test',{waitUntil:'networkidle'});
  await react.waitForFunction(()=>!!window.inspectionTest);
  await react.addStyleTag({content:'nextjs-portal { display:none !important; }'});
  const readOriginal=()=>original.evaluate(()=>window.payload());
  const readReact=()=>react.evaluate(()=>window.inspectionTest.getPayload());
  const initial=await readOriginal();assert.deepEqual(await readReact(),initial);
  const compare=async()=>assert.deepEqual(await readReact(),await readOriginal());
  const clickBoth=async(selector)=>{await original.locator(selector).click();await react.locator(selector).click();await compare();};
  for (const width of [320,375,500,501,780,781,1080,1440]) {
    for(const page of [original,react])await page.setViewportSize({width,height:900});
    for(const state of ['initial-entree','initial-sortie','filled-entree','filled-sortie']) {
      const filled=state.startsWith('filled'); const phase=state.endsWith('entree')?'entree':'sortie';
      await original.evaluate(({payload,phase})=>{window.apply(payload);window.show(phase)}, {payload:filled?fixture:initial,phase});
      await react.evaluate(({payload})=>window.inspectionTest.replacePayload(payload),{payload:filled?fixture:initial});
      await react.locator('#tab-'+phase).click();
      for(const [label,page] of [['html',original],['react',react]]){
        await page.locator('body').click({position:{x:0,y:0},force:true});
        await page.evaluate(()=>window.scrollTo(0,0));
        await page.screenshot({path:resolve(artifacts,`${label}-${width}-${state}.png`),fullPage:true,animations:'disabled'});
      }
      await compare();
      const snapshot=page=>page.evaluate(()=>({text:document.querySelector('main').innerText.replace(/\s+/g,' ').trim(),fields:[...document.querySelectorAll('input:not([type=checkbox]),textarea')].map(e=>[e.id,e.value,e.getAttribute('placeholder')]),labels:[...document.querySelectorAll('button[aria-label]')].map(e=>[e.getAttribute('aria-label'),e.getAttribute('aria-pressed')]),logo:document.querySelector('header img').getAttribute('src')}));
      assert.deepEqual(await snapshot(react),await snapshot(original));
    }
    console.log(`Visual fixtures captured: ${width}px, 4 states`);
  }
  // Initialize through the prop and verify snapshots are detached from internal state.
  await react.evaluate(p=>window.inspectionTest.mountPayload(p),fixture);
  await react.waitForFunction(()=>document.querySelector('#reference').value==='LC-TEST-2026');
  assert.deepEqual(await readReact(),fixture);
  await react.evaluate(()=>{const p=window.inspectionTest.getPayload();p.data.reference='mutated copy'});
  assert.deepEqual(await readReact(),fixture);
  await original.evaluate(p=>{window.apply(p);window.show('entree')},initial);
  await react.evaluate(p=>window.inspectionTest.replacePayload(p),initial);
  await react.locator('#tab-entree').click();
  for(const selector of ['[data-phase=entree][data-idx="0"][data-value=conforme]','[data-phase=entree][data-idx="0"][data-value=conforme]','[data-phase=entree][data-idx="0"][data-value=corriger]','[data-phase=entree][data-idx="0"][data-value=conforme]'])await clickBoth(selector);
  for(const page of [original,react])assert.equal(await page.locator('#progress-entree').textContent(),'1/13');
  for(const phase of ['entree','sortie'])for(const index of [9,10,11]){
    for(const page of [original,react])await page.locator('#tab-'+phase).click();
    await clickBoth(`[data-phase=${phase}][data-idx="${index}"][data-value=corriger]`);
    for(const page of [original,react]){await page.locator('#tab-'+(phase==='entree'?'sortie':'entree')).click();assert.equal(await page.locator('#safety-warning').isVisible(),true);await page.locator('#tab-'+phase).click();}
    await clickBoth(`[data-phase=${phase}][data-idx="${index}"][data-value=corriger]`);
    for(const page of [original,react])assert.equal(await page.locator('#safety-warning').isVisible(),false);
  }
  for(const group of ['entree','sortie','consignes']){
    for(const page of [original,react])await page.locator('#tab-'+(group==='entree'?'entree':'sortie')).click();
    await clickBoth(`input[data-group=${group}][data-idx="0"]`);
  }
  await clickBoth('#accepted');
  for(const page of [original,react]){assert.equal(await page.locator('#progress-entree').textContent(),'1/13');assert.equal(await page.locator('#progress-sortie').textContent(),'0/13');}
  for(const [id,value] of Object.entries(fixture.data)){
    for(const page of [original,react]){if(id.startsWith('entry-'))await page.locator('#tab-entree').click();if(id.startsWith('exit-'))await page.locator('#tab-sortie').click();await page.locator('#'+id).fill(value);}
    await compare();
  }
  for(const page of [original,react])await page.locator('#guests').fill('');await compare();
  // JSON preserves every key/value, filename and indentation.
  for(const [name,page] of [['html',original],['react',react]]){
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#json').click()]);
    assert.equal(download.suggestedFilename(),'etat-des-lieux-domaine-lo-carmalhon.json');
    const path=resolve(artifacts,name+'-export.json');await download.saveAs(path);
    assert.equal(await readFile(path,'utf8'),JSON.stringify(await readOriginal(),null,2));
  }
  // No storage, no pretend success and no local draft written.
  await react.locator('#save').click();assert.match(await react.locator('#feedback').textContent(),/Sauvegarde indisponible/);
  await react.locator('#load').click();assert.match(await react.locator('#feedback').textContent(),/Rechargement indisponible/);
  assert.equal(await react.evaluate(()=>localStorage.length),0);
  // Invalid transport data is rejected without modifying the current dossier.
  for(const change of ['version','length','choice','boolean','field']){
    assert.equal(await react.evaluate(change=>{
      const p=window.inspectionTest.getPayload();
      if(change==='version')p.version=2;
      if(change==='length')p.checks.entree.pop();
      if(change==='choice')p.checks.entree[0]='unknown';
      if(change==='boolean')p.steps.entree[0]='true';
      if(change==='field')p.data.guests=6;
      try{window.inspectionTest.replacePayload(p);return false}catch{return true}
    },change),true);
  }
  // Every answered control, including À corriger, contributes to 13/13.
  for(const page of [original,react]){
    await page.locator('#tab-entree').click();
    for(let i=0;i<13;i++){
      const button=page.locator(`[data-phase=entree][data-idx="${i}"][data-value=corriger]`);
      if(await button.getAttribute('aria-pressed')!=='true')await button.click();
    }
    assert.equal(await page.locator('#done-entree').textContent(),'13/13');
    assert.equal(await page.locator('#progress-track').evaluate(e=>e.style.width),'100%');
  }
  await compare();
  // Reset cancellation does nothing, then confirmed reset restores exact defaults.
  for(const page of [original,react]){
    const previous=page===original?await readOriginal():await readReact();
    page.once('dialog',d=>d.dismiss());await page.locator('#reset').click();
    assert.deepEqual(page===original?await readOriginal():await readReact(),previous);
    page.once('dialog',d=>d.accept());await page.locator('#reset').click();
  }
  await compare();assert.deepEqual(await readReact(),initial);
  // Browser print is invoked once; print CSS always shows both phases.
  for(const [name,page] of [['html',original],['react',react]]){
    await page.evaluate(()=>{window.printCalls=0;window.print=()=>{window.printCalls++}});
    await page.locator('#print').click();assert.equal(await page.evaluate(()=>window.printCalls),1);
    if(name==='html')await page.evaluate(p=>window.apply(p),fixture);else await page.evaluate(p=>window.inspectionTest.replacePayload(p),fixture);
    await page.setViewportSize({width:1080,height:900});
    for(const phase of ['entree','sortie']){
      await page.locator('#tab-'+phase).click();await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('#phase-entree').isVisible(),true);assert.equal(await page.locator('#phase-sortie').isVisible(),true);
      for(const selector of ['#print','#tab-entree','#progress-track'])assert.equal(await page.locator(selector).isVisible(),false);
      await page.screenshot({path:resolve(artifacts,`${name}-print-${phase}.png`),fullPage:true,animations:'disabled'});
      await page.pdf({path:resolve(artifacts,`${name}-print-${phase}.pdf`),format:'A4',printBackground:true});
      await page.emulateMedia({media:'screen'});
    }
  }
  assert.deepEqual(failures,[]);
  const comparison=spawnSync('python',[resolve(root,'tests/etats-des-lieux/compare-images.py'),artifacts],{stdio:'inherit'});
  assert.equal(comparison.status,0,'Unexplained visual differences');
  await writeFile(resolve(artifacts,'results.json'),JSON.stringify({widths:[320,375,500,501,780,781,1080,1440],visualPairs:32,printPairs:2,functional:'passed',referenceSHA256:createHash('sha256').update(reference).digest('hex')},null,2));
  console.log('Payload, interactions, all safety cases, procedures, JSON, reset, unavailable storage and print: PASS');
} finally {
  if(browser)await browser.close();
  if(child?.pid){try{process.kill(-child.pid,'SIGTERM')}catch{}await new Promise(yes=>{if(child.exitCode!==null)return yes();child.once('exit',yes)})}
  if(server)await new Promise(yes=>server.close(yes));
  await rm(route,{recursive:true,force:true});
  // Discard only generated dev types, which refer to the temporary route.
  await rm(resolve(root,'.next/dev'),{recursive:true,force:true});
}
