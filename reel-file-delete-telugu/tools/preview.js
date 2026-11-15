// Usage: node preview.js outDir t1 t2 ...  -> PNG stills of the reel at the given times
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [outDir, ...times] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '../src/reel.html'));
  const info = await page.evaluate(() => window.setup());
  console.log('duration', info.duration, 'sfx cues', info.sfx.length);
  for (const t of times) {
    await page.evaluate(t => window.render(t), parseFloat(t));
    await page.screenshot({ path: path.join(outDir, `f_${parseFloat(t).toFixed(2)}.png`) });
  }
  await browser.close();
})();
