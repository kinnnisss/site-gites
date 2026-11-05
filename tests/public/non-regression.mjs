/** Local public-page regression against a separate, unchanged source checkout. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
if (process.env.NODE_ENV === 'production') throw new Error('Local test only.');
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const currentRoot = resolve(import.meta.dirname, '../..');
assert.ok(process.env.PUBLIC_BASELINE_ROOT, 'PUBLIC_BASELINE_ROOT must identify the phase-4 checkout with dependencies installed.');
const baselineRoot = resolve(process.env.PUBLIC_BASELINE_ROOT);
assert.notEqual(baselineRoot, currentRoot, 'Use a separate baseline checkout.');
const roots = [baselineRoot, currentRoot];
for (const root of roots) await access(resolve(root, 'node_modules/next/dist/bin/next'));
const artifacts = resolve(process.env.PUBLIC_ARTIFACTS || '/tmp/site-gites-public', `run-${Date.now()}`);
await mkdir(artifacts, { recursive: true });
const children = []; let browser;
try {
  for (let i = 0; i < roots.length; i++) {
    const child = spawn(process.execPath, [resolve(roots[i], 'node_modules/next/dist/bin/next'), 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', String(3310 + i)], {
      cwd: roots[i], detached: true, stdio: ['ignore', 'pipe', 'pipe'],
    });
    children.push(child); let logs = '';
    for (const stream of [child.stdout, child.stderr]) stream.on('data', d => { logs += d; });
    for (let attempt = 0;; attempt++) {
      if (child.exitCode !== null) throw new Error('Local server exited: ' + logs);
      try { if ((await fetch(`http://127.0.0.1:${3310 + i}/`)).ok) break; } catch {}
      if (attempt > 120) throw new Error('Local public server unavailable.');
      await delay(250);
    }
  }
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const pages = [await browser.newPage(), await browser.newPage()]; const errors = [];
  for (const page of pages) page.on('pageerror', e => errors.push(e.message));
  for (const [name, path] of [['home', '/'], ['legal', '/mentions-legales'], ['privacy', '/confidentialite']]) {
    for (const width of [375, 1440]) {
      const snapshots = [];
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]; await page.setViewportSize({ width, height: 900 });
        const response = await page.goto(`http://127.0.0.1:${3310 + i}${path}`, { waitUntil: 'networkidle' });
        assert.equal(response.status(), 200);
        await page.addStyleTag({ content: 'nextjs-portal {display:none!important}' });
        await page.screenshot({ path: `${artifacts}/${i}-${name}-${width}.png`, fullPage: true, animations: 'disabled' });
        snapshots.push(await page.evaluate(() => ({
          text: document.querySelector('.public-site').innerText, title: document.title,
          // Next may move its own next-size-adjust meta; compare attributes, not tag order.
          meta: [...document.querySelectorAll('meta')].map(e => [e.getAttribute('name'), e.getAttribute('property'), e.content, e.getAttribute('charset')])
            .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
          links: [...document.querySelectorAll('.public-site a')].map(e => [e.textContent, e.getAttribute('href')]),
        })));
      }
      await writeFile(resolve(artifacts, `${name}-${width}-content.json`), JSON.stringify(snapshots, null, 2));
      const different = Object.keys(snapshots[0]).filter(key => JSON.stringify(snapshots[0][key]) !== JSON.stringify(snapshots[1][key]));
      assert.deepEqual(different, [], `Public content/metadata/links differ: ${name}, ${width}px`);
    }
    for (const width of [320, 768, 1024]) {
      await pages[1].setViewportSize({ width, height: 900 });
      await pages[1].goto('http://127.0.0.1:3311' + path);
      assert.equal(await pages[1].evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    }
  }
  const page = pages[1]; await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('http://127.0.0.1:3311/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  assert.equal(await page.getByRole('link', { name: 'Aller au contenu' }).evaluate(e => e === document.activeElement), true);
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#contenu').evaluate(e => e === document.activeElement), true);
  const toggle = page.locator('.header-menu-toggle');
  await toggle.click(); assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(await toggle.evaluate(e => e === document.activeElement), true);
  await toggle.click(); await page.locator('#main-navigation a[href="/#contact"]').click();
  await page.waitForURL('**/#contact');
  assert.equal(new URL(page.url()).hash, '#contact'); assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  await page.goto('http://127.0.0.1:3311/mentions-legales', { waitUntil: 'networkidle' });
  const anchor = page.locator('nav[aria-labelledby="legal-contents-title"] a').first();
  const href = await anchor.getAttribute('href'); await anchor.click();
  await page.waitForURL(url => url.hash === href);
  assert.equal(new URL(page.url()).hash, href);
  assert.deepEqual(errors, []);
  const result = spawnSync('python3', ['-c', `import sys
from pathlib import Path
from PIL import Image,ImageChops
p=Path(sys.argv[1])
for a in sorted(p.glob('0-*.png')):
 b=p/('1-'+a.name[2:])
 x,y=Image.open(a).convert('RGB'),Image.open(b).convert('RGB')
 assert x.size==y.size and ImageChops.difference(x,y).getbbox() is None,a.name
print('6/6 public page pairs identical pixel by pixel')`, artifacts], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  console.log(result.stdout.trim());
  await writeFile(resolve(artifacts, 'results.json'), JSON.stringify({
    baselineRoot, pixelPairs: 6, contentMetadataLinks: 'identical', responsiveChecks: 9,
    keyboardMenuAnchors: 'passed', pageErrors: errors,
  }, null, 2));
  console.log('Public content, keyboard, menu, anchors and responsive PASS. Artifacts: ' + artifacts);
} finally {
  if (browser) await browser.close();
  for (const child of children) {
    try { process.kill(-child.pid, 'SIGTERM'); } catch {}
    await new Promise(yes => { if (child.exitCode !== null) return yes(); child.once('exit', yes); });
  }
}
