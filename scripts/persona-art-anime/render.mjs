import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch();
for (const name of process.argv.slice(2)) {
  const fn = (await import(`./chars/${name}.js?${Date.now()}`)).default;
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  await page.setContent(fn());
  await page.screenshot({ path: `out/${name}.png` });
  await page.close();
  console.log(name, 'ok');
}
await browser.close();
