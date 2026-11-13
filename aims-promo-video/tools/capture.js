// usage: node capture.js <html> <outdir|-> <fps> [times...]
// with times: writes PNG previews; with "-" as outdir: streams JPEG frames to stdout for ffmpeg
const { chromium } = require('playwright');
(async () => {
  const [html, out, fpsS, ...times] = process.argv.slice(2);
  const fps = +fpsS;
  const W = +(process.env.W || 1920), H = +(process.env.H || 1080);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', m => process.stderr.write('[page] ' + m.text() + '\n'));
  page.on('pageerror', e => process.stderr.write('[pageerror] ' + e.message + '\n'));
  await page.goto('file://' + require('path').resolve(html));
  await page.evaluate(() => window.ready);
  if (times.length) {
    for (const t of times) {
      await page.evaluate(t => seek(t), +t);
      await page.screenshot({ path: `${out}/f_${(+t).toFixed(2).padStart(6, '0')}.png` });
    }
  } else {
    const dur = await page.evaluate(() => DURATION);
    const n = Math.round(dur * fps);
    for (let f = 0; f < n; f++) {
      await page.evaluate(t => seek(t), f / fps);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!process.stdout.write(buf)) await new Promise(r => process.stdout.once('drain', r));
      if (f % 150 === 0) process.stderr.write(`frame ${f}/${n}\n`);
    }
  }
  await browser.close();
})();
