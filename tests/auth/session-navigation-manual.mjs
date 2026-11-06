/** Explicit development-only Auth acceptance. No dossier/member writes or emails. */
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { matchesDevelopmentProject } from '../etats-des-lieux/development-target.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.env.TEAM_TEST_BASE_URL || 'http://127.0.0.1:3500';
const names = ['ADMIN', 'AGENT_A', 'AGENT_B', 'INACTIVE', 'NO_MEMBER'];
const report = { at: new Date().toISOString(), mode: 'real-next-auth-only', project_ref: 'jijjjgsfdbrkvqvhyjwr', profiles: [], business_mutations: 0, failures: [] };
const ensure = (ok, label) => { if (!ok) throw new Error(label); };
let browser;
try {
  ensure(process.argv.includes('--allow-development-auth'), 'Explicit development Auth option required');
  ensure(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Loopback Next server required');
  ensure(execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim() === 'fix/recette-espace-equipe', 'Correction branch required');
  ensure(process.env.VERCEL_ENV !== 'production', 'Production context refused');
  ensure(matchesDevelopmentProject(process.env.NEXT_PUBLIC_SUPABASE_URL, report.project_ref) && matchesDevelopmentProject(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.TEAM_TEST_EXPECTED_PROJECT_REF), 'Development project pin required');
  ensure(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_'), 'Publishable key required');
  ensure(names.every(n => process.env[`TEAM_TEST_${n}_EMAIL`] && process.env[`TEAM_TEST_${n}_PASSWORD`]), 'Five fixture credentials required');
  ensure(new Set(names.map(n => process.env[`TEAM_TEST_${n}_EMAIL`].trim().toLowerCase())).size === 5, 'Distinct fixture accounts required');
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  for (const name of names) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const item = { profile: name, passed: false };
    report.profiles.push(item);
    let stage = 'open_login', loggedIn = false;
    try {
      // Only the existing login/logout actions may POST. Never submit a business API.
      await context.route('**/*', async route => {
        const r = route.request(), u = new URL(r.url());
        const allowed = u.origin === new URL(base).origin && (
          ['GET', 'HEAD'].includes(r.method()) || r.method() === 'POST' && ['/equipe/connexion', '/equipe'].includes(u.pathname)
        );
        if (!allowed) { item.out_of_scope_request_blocked = true; await route.abort(); return; }
        await route.continue();
      });
      await page.goto(base + '/equipe/connexion', { waitUntil: 'networkidle' });
      stage = 'login';
      await page.getByLabel('Adresse e-mail').fill(process.env[`TEAM_TEST_${name}_EMAIL`]);
      await page.getByLabel('Mot de passe', { exact: true }).fill(process.env[`TEAM_TEST_${name}_PASSWORD`]);
      const start = performance.now();
      await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
      const active = ['ADMIN', 'AGENT_A', 'AGENT_B'].includes(name);
      if (active) {
        await page.waitForURL(url => url.pathname === '/equipe', { timeout: 30000 });
        loggedIn = true;
        item.login_elapsed_ms = Math.round((performance.now() - start) * 10) / 10;
        stage = 'verify_session';
        const session = await page.evaluate(async () => {
          const r = await fetch('/equipe/api/session', { cache: 'no-store' });
          const b = await r.json(); return { status: r.status, role: b.role, cache: r.headers.get('cache-control') };
        });
        ensure(session.status === 200 && session.role === (name === 'ADMIN' ? 'admin' : 'agent'), 'Unexpected fixture role');
        ensure(session.cache?.includes('no-store'), 'Private session must not be cached');
        item.session_status = session.status; item.role = session.role;
        stage = 'verify_cookie_attributes';
        // Inspect this isolated context: URL-filtered cookies may omit Secure
        // cookies on HTTP loopback even when Chromium sends them to the app.
        const cookies = (await context.cookies()).filter(c => c.name.startsWith('sb-'));
        item.cookie_attribute_observations = cookies.map(({ httpOnly, secure, sameSite, path }) => ({ httpOnly, secure, sameSite, path }));
        ensure(cookies.length > 0 && cookies.every(c => c.httpOnly && c.secure && c.sameSite === 'Lax' && c.path === '/equipe'), 'Secure scoped session cookies required on next start');
        item.cookies = { httpOnly: true, secure: true, sameSite: 'Lax', path: '/equipe', values_recorded: false };
        stage = 'existing_session_redirect';
        const redirectStart = performance.now();
        await page.goto(base + '/equipe/connexion', { waitUntil: 'networkidle' });
        ensure(new URL(page.url()).pathname === '/equipe', 'Active fixture was asked to log in again');
        item.existing_session_redirect = '/equipe';
        item.redirect_elapsed_ms = Math.round((performance.now() - redirectStart) * 10) / 10;
        stage = 'logout';
        await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
        await page.waitForURL(url => url.pathname === '/equipe/connexion', { timeout: 30000 });
        loggedIn = false;
      } else {
        await page.getByRole('status').filter({ hasText: 'Connexion refusée.' }).waitFor({ timeout: 30000 });
        item.refusal_elapsed_ms = Math.round((performance.now() - start) * 10) / 10;
        item.login = 'refused_as_expected';
        ensure(new URL(page.url()).pathname === '/equipe/connexion', 'Refused fixture redirected into private space');
      }
      stage = 'verify_logged_out';
      const status = await page.evaluate(async () => (await fetch('/equipe/api/session', { cache: 'no-store' })).status);
      ensure(status === 401, 'Session access persists after refusal/logout');
      ensure((await context.cookies()).filter(c => c.name.startsWith('sb-')).length === 0, 'Session cookie remains after refusal/logout');
      item.after_logout_or_refusal = 401;
      ensure(!item.out_of_scope_request_blocked, 'Unexpected request blocked');
      item.passed = true;
    } catch {
      report.failures.push({ profile: name, stage, error: 'Acceptance failed; sensitive details suppressed' });
    } finally {
      if (loggedIn) {
        try {
          await page.goto(base + '/equipe');
          await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
          await page.waitForURL(url => url.pathname === '/equipe/connexion');
          item.cleanup_logout = 'confirmed';
        } catch { item.cleanup_logout = 'not_confirmed'; }
      }
      await context.close();
    }
    if (!item.passed) break;
  }
} catch { report.failures.push({ error: 'Precondition or browser failure; sensitive details suppressed' }); }
finally {
  if (browser) await browser.close();
  report.success = report.profiles.length === 5 && report.profiles.every(p => p.passed) && report.failures.length === 0;
  if (process.env.TEAM_AUTH_REPORT) await writeFile(process.env.TEAM_AUTH_REPORT, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  if (!report.success) process.exitCode = 1;
}
