// Renders reel.html frame-by-frame in headless Chromium and muxes it with the
// soundtrack into an Instagram-ready MP4 (1080x1920, 30 fps, H.264 + AAC).
//
//   node render.js                      -> full video
//   node render.js --stills 1.2,4.3     -> PNG stills of those timestamps
//
// Put your logo next to this file as logo.png / logo.jpg and it is used
// automatically (it is cropped into the circular badge).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const DIR = __dirname, BUILD = path.join(DIR, 'build');
const FPS = 30, DUR = 18.0;
const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const OUT = opt('--out') || path.join(DIR, 'sundarlysh_workshop_teaser.mp4');

function findLogo() {
  for (const n of ['logo.png', 'logo.jpg', 'logo.jpeg', 'logo.webp']) {
    const p = path.join(DIR, n);
    if (fs.existsSync(p)) {
      const ext = n.split('.').pop().replace('jpg', 'jpeg');
      return `data:image/${ext};base64,${fs.readFileSync(p).toString('base64')}`;
    }
  }
  return null;
}

(async () => {
  const timeline = JSON.parse(fs.readFileSync(path.join(BUILD, 'timeline.json'), 'utf8'));
  const logo = findLogo();
  console.log(logo ? 'Using logo file.' : 'No logo file found - using built-in "S" badge.');

  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.addInitScript(([tl, lg]) => { window.TIMELINE = tl; window.LOGO_URL = lg; }, [timeline, logo]);
  page.on('pageerror', e => { console.error('page error:', e); process.exit(1); });
  await page.goto('file://' + path.join(DIR, 'reel.html'));
  await page.evaluate(() => window.ready);

  const grab = (t, type, q) => page.evaluate(([t, type, q]) => {
    window.render(t); return document.getElementById('c').toDataURL(type, q);
  }, [t, type, q]).then(d => Buffer.from(d.split(',')[1], 'base64'));

  const stills = opt('--stills');
  if (stills) {
    for (const t of stills.split(',').map(Number)) {
      const f = path.join(BUILD, `still_${t.toFixed(2)}.png`);
      fs.writeFileSync(f, await grab(t, 'image/png'));
      console.log('wrote', f);
    }
    await browser.close();
    return;
  }

  const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-i', path.join(BUILD, 'soundtrack.wav'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-level', '4.2', '-g', '60', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '256k', '-ar', '44100',
    '-shortest', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));

  const total = Math.round(FPS * DUR);
  for (let f = 0; f < total; f++) {
    const buf = await grab(f / FPS, 'image/jpeg', 0.96);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end();
  await done;

  // Instagram cover image (end-card frame)
  fs.writeFileSync(path.join(DIR, 'cover.jpg'), await grab(16.4, 'image/jpeg', 0.95));
  await browser.close();
  console.log('wrote', OUT);
})().catch(e => { console.error(e); process.exit(1); });
