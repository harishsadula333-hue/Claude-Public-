// Render any-size SVGs (transparent where the SVG has no background).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [outdir, scale, ...files] = process.argv.slice(2);
  const b = await chromium.launch();
  for (const f of files) {
    const svg = fs.readFileSync(f, 'utf8');
    const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: Number(scale) });
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await p.locator('svg').first().screenshot({ path: path.join(outdir, path.basename(f).replace(/\.svg$/, '.png')), omitBackground: true });
    await p.close();
  }
  await b.close();
})();
