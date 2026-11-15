// Usage: node render.js <startFrame> <endFrame(excl)> <out.mp4> [fps]
// Renders frames of src/reel.html via Playwright and pipes them to ffmpeg (H.264).
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
(async () => {
  const [a, b, out, fpsArg] = process.argv.slice(2);
  const fps = parseInt(fpsArg || '30', 10);
  const browser = await chromium.launch({ args: ['--disable-gpu', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto('file://' + path.resolve(__dirname, '../src/reel.html'));
  const info = await page.evaluate(() => window.setup());
  fs.writeFileSync(path.resolve(__dirname, '../build/sfx.json'), JSON.stringify(info, null, 1));
  const total = Math.round(info.duration * fps);
  const start = parseInt(a, 10), end = Math.min(parseInt(b, 10), total);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-threads', '2', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = start; f < end; f++) {
    await page.evaluate(t => window.render(t), f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - start) % 150 === 0) console.log(`[${out}] frame ${f}/${end} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log(`[${out}] done ${end - start} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
})();
