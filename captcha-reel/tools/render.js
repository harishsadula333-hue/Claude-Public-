// node render.js start end out.mp4 -> frames piped to ffmpeg
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path'); const serve = require('./serve');
(async () => {
  const [a, b, out] = process.argv.slice(2), fps = 30; const { srv, url } = await serve();
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await p.goto(url); await p.waitForFunction(() => window.__ready, null, { timeout: 60000 }); const info = await p.evaluate(() => window.setup());
  fs.writeFileSync(path.resolve(__dirname, '../build/sfx.json'), JSON.stringify(info));
  const total = Math.round(info.duration * fps), s = +a, e = Math.min(+b, total);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-threads', '1', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = s; f < e; f++) { await p.evaluate(t => window.render(t), f / fps); const buf = await p.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if ((f - s) % 150 === 0) console.log(`[${path.basename(out)}] ${f}/${e} ${((Date.now() - t0) / 1000).toFixed(0)}s`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await br.close(); srv.close(); console.log(`[${path.basename(out)}] done ${e - s} frames ${((Date.now() - t0) / 1000).toFixed(0)}s`);
})();
