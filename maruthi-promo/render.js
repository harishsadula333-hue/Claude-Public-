// usage: node render.js preview t1,t2,...   |  node render.js all
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const FPS = 60, DUR = 40;
(async () => {
  const mode = process.argv[2];
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const url = 'file://' + path.resolve(__dirname, 'index.html');
  const mk = async () => { const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } }); p.on('console', m => console.log('PAGE', m.text())); p.on('pageerror', e => console.log('ERR', e.message)); await p.goto(url); await p.evaluate(() => window.ready); return p; };
  if (mode === 'preview') {
    const p = await mk(); fs.mkdirSync('preview', { recursive: true });
    for (const t of process.argv[3].split(',').map(Number)) {
      await p.evaluate(t => render(t), t);
      await p.screenshot({ path: `preview/t${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 80 });
    }
  } else {
    fs.mkdirSync('frames', { recursive: true });
    const total = FPS * DUR, NW = 4;
    await Promise.all(Array.from({ length: NW }, async (_, w) => {
      const p = await mk();
      for (let f = w; f < total; f += NW) {
        await p.evaluate(t => render(t), f / FPS);
        await p.screenshot({ path: `frames/${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 95 });
        if (f % 600 === 0) console.log('frame', f);
      }
    }));
  }
  await browser.close();
})();
