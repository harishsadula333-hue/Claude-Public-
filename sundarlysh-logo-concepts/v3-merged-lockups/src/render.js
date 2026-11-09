// Render SVGs to PNG with the pre-installed Playwright Chromium.
// usage: node render.js <outdir> <scale> file1.svg file2.svg ...
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const [outdir, scale, ...files] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: Number(scale) });
  for (const f of files) {
    const svg = fs.readFileSync(f, 'utf8');
    await page.setContent(`<html><body style="margin:0;background:#fff">${svg}</body></html>`);
    const out = path.join(outdir, path.basename(f).replace(/\.svg$/, '.png'));
    await page.locator('svg').first().screenshot({ path: out, omitBackground: false });
    console.log(out);
  }
  await browser.close();
})();
