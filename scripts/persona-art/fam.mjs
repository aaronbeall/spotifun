import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { writeFileSync } from 'fs';
import { execFileSync } from 'child_process';
const browser = await chromium.launch();
const only = process.argv.slice(3);
for (const fam of process.argv[2].split(',')) {
  const mod = (await import(`./${fam}.js?${Date.now()}`)).default;
  const ids = [];
  for (const [id, fn] of Object.entries(mod)) {
    ids.push(id);
    if (only.length && !only.includes(id)) continue;
    const html = fn();
    const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
    await page.setContent(html);
    await page.screenshot({ path: `out/${id}.png` });
    await page.close();
  }
  execFileSync('python3', ['-I', 'sheet.py', `out/${fam}.png`, ...ids]);
  console.log(fam, 'ok', ids.length);
}
await browser.close();
