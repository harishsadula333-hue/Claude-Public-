// node render_cat.js <catalog.html> <out.pdf> <png_prefix>
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [html, pdf, prefix] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 900, height: 1200 } });
  await page.goto('file://' + path.resolve(html), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const fonts = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family));
  console.log('fonts loaded:', [...new Set(fonts)].join(', '));
  await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
  const pages = await page.$$('section.page');
  for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: `${prefix}-page${i + 1}.png` });
  console.log('pages:', pages.length);
  await browser.close();
})();
