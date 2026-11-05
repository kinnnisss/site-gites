/** Local HTTP checks only: never supplies real credentials or calls an Auth mutation. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
const root = resolve(import.meta.dirname, '../..');
const loadModule = createRequire(import.meta.url);
const { chromium } = loadModule(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.env.TEAM_TEST_BASE_URL || 'http://127.0.0.1:3000';
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname), 'Local server required');
let count = 0;
async function checks(origin, missingConfig) {
  const get = path => fetch(origin + path, { redirect: 'manual' });
  for (const path of ['/equipe','/equipe/mot-de-passe']) {
    const response = await get(path);
    assert.equal(response.status,307);
    assert.ok(response.headers.get('location').startsWith('/equipe/connexion?etat='));
    assert.match(response.headers.get('cache-control'),/no-store/);
    count++;
  }
  const session = await get('/equipe/api/session');
  assert.equal(session.status,missingConfig ? 503 : 401);
  assert.deepEqual(Object.keys(await session.json()),['error']); count++;
  const forged = await fetch(origin+'/equipe/api/session',{headers:{'x-team-role':'admin',cookie:'role=admin; active=true'}});
  assert.equal(forged.status,missingConfig?503:401); count++;
  const url=origin+'/equipe/api/membres/00000000-0000-4000-8000-000000000001';
  const body=JSON.stringify({role:'admin',active:true});
  const patch=await fetch(url,{method:'PATCH',headers:{origin,'content-type':'application/json'},body});
  assert.equal(patch.status,missingConfig?503:401); count++;
  const csrf=await fetch(url,{method:'PATCH',headers:{origin:'https://untrusted.example','content-type':'application/json'},body});
  assert.equal(csrf.status,403); count++;
  const recovery=await get('/equipe/confirmation?type=recovery&token_hash=short&next=https://untrusted.example');
  assert.equal(recovery.status,307);
  assert.equal(new URL(recovery.headers.get('location'),origin).origin,origin);
  assert.equal(new URL(recovery.headers.get('location'),origin).pathname,'/equipe/connexion');count++;
  for(const path of ['/equipe/inscription','/equipe/etats-des-lieux/nouveau','/phase2-local-test']) {
    assert.equal((await get(path)).status,404);count++;
  }
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  try {
    const page=await browser.newPage({viewport:{width:375,height:900}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/equipe/connexion?etat=__proto__',{waitUntil:'networkidle'});
    assert.equal(await page.getByRole('heading',{name:'Connexion à l’Espace Équipe'}).count(),1);
    const button=page.getByRole('button',{name:'Se connecter',exact:true});
    assert.equal(await button.isDisabled(),missingConfig);count++;
    if(!missingConfig) {
      // Invalid syntax is rejected by our action before creating a Supabase client.
      await page.getByLabel('Adresse e-mail').fill('invalid-email');
      await page.getByLabel('Mot de passe',{exact:true}).fill('not-a-real-password');
      await page.locator('form').evaluate(e=>{e.noValidate=true});
      await button.click();
      await page.getByRole('status').filter({hasText:'Connexion refusée.'}).waitFor();count++;
    }
    await page.goto(origin+'/equipe/recuperation',{waitUntil:'networkidle'});
    if(!process.env.TEAM_APP_ORIGIN || missingConfig) {
      assert.equal(await page.getByRole('button',{name:'Demander un lien'}).isDisabled(),true);count++;
    }
    assert.deepEqual(errors,[]);
  } finally {await browser.close()}
}
await checks(base,false);
// Reuse the real build with configuration absent, not a fake Auth provider.
const env={...process.env};delete env.NEXT_PUBLIC_SUPABASE_URL;delete env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;delete env.TEAM_APP_ORIGIN;
const child=spawn(process.execPath,[resolve(root,'node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port','3002'],{cwd:root,env,detached:true,stdio:'ignore'});
try {
  for(let i=0;;i++){
    if(child.exitCode!==null)throw new Error('Local server exited');
    try{if((await fetch('http://127.0.0.1:3002/equipe/connexion')).ok)break}catch{}
    if(i===60)throw new Error('Missing-config local server not ready');await delay(250);
  }
  await checks('http://127.0.0.1:3002',true);
}finally{
  try{process.kill(-child.pid,'SIGTERM')}catch{}
  await new Promise(yes=>{if(child.exitCode!==null)return yes();child.once('exit',yes)});
}
console.log(`${count} local HTTP/browser checks passed. Real Supabase login/refresh/RLS remain untested.`);
