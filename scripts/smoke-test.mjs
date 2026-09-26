// Mở từng route của site, gom lỗi console/pageerror và chụp ảnh để review.
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
const base = pathToFileURL(process.cwd() + '/site/index.html').href;
const routes = ['home', 'start', 'architecture', 'lifecycle', 'hooks', 'rules', 'agents', 'skills', 'skill/ak-cook', 'skill/ak-plan', 'skill/ak-fix', 'skill/ak-handoff', 'flags', 'workflows', 'chooser', 'tips', 'config', 'cli', 'troubleshoot', 'sources'];
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
for (const r of routes) {
  await page.goto(`${base}#/${r}`);
  await page.waitForTimeout(150);
  const visible = await page.$$eval('section[data-page]:not([hidden])', (s) => s.map((x) => x.dataset.page + ':' + x.innerText.length));
  console.log(r.padEnd(16), visible.join(','));
  if (process.env.SHOTS) await page.screenshot({ path: `/tmp/akg-${r.replace('/', '_')}.png`, fullPage: false });
}
await page.fill('#globalSearch', '--tdd');
console.log('search hits', await page.$$eval('#searchResults a', (a) => a.length));
await page.setViewportSize({ width: 390, height: 800 });
await page.goto(`${base}#/skills`);
await page.reload();
await page.waitForTimeout(400);
if (process.env.SHOTS) await page.screenshot({ path: '/tmp/akg-mobile.png' });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
