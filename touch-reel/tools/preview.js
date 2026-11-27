// node preview.js outDir t1 t2 ...
const { chromium } = require('playwright'); const path = require('path'); const serve = require('./serve');
(async () => {
  const [outDir, ...times] = process.argv.slice(2); const { srv, url } = await serve();
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGE ERROR', e.message)); p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await p.goto(url); await p.waitForFunction(() => window.__ready, null, { timeout: 60000 }); const info = await p.evaluate(() => window.setup());
  console.log('duration', info.duration, 'sfx', info.sfx.length);
  for (const t of times) { const t0 = Date.now(); await p.evaluate(t => window.render(t), +t); await p.screenshot({ path: path.join(outDir, `f_${(+t).toFixed(2)}.png`) }); console.log(t, Date.now() - t0, 'ms'); }
  await b.close(); srv.close();
})();
