// Renders an HTML scene frame-by-frame by seeking every CSS animation.
// usage: node render.js <scene.html> <outDir> <seconds> [fps]
//        node render.js --still <scene.html> <out.png> <seconds> [selector]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const http = require('http');
const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg' };
let server;
function serve() {
  return new Promise((res) => {
    server = http.createServer((req, rsp) => {
      const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(ROOT) || !fs.existsSync(f)) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(rsp);
    }).listen(0, '127.0.0.1', () => res(server.address().port));
  });
}

async function open(file) {
  const port = await serve();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${port}/` + path.relative(ROOT, path.resolve(file)));
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  await page.waitForTimeout(300);
  return { browser, page };
}

async function seek(page, ms) {
  await page.evaluate((t) => {
    for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; }
  }, ms);
}

(async () => {
  const args = process.argv.slice(2);
  if (args[0] === '--still') {
    const [, file, out, sec, sel] = args;
    const { browser, page } = await open(file);
    await seek(page, parseFloat(sec) * 1000);
    if (sel) await page.locator(sel).screenshot({ path: out, omitBackground: true });
    else await page.screenshot({ path: out, omitBackground: true });
    await browser.close(); server.close();
    return;
  }
  const [file, outDir, sec, fpsArg] = args;
  const fps = parseFloat(fpsArg || '30');
  const n = Math.round(parseFloat(sec) * fps);
  fs.mkdirSync(outDir, { recursive: true });
  const { browser, page } = await open(file);
  for (let i = 0; i < n; i++) {
    await seek(page, (i / fps) * 1000);
    await page.screenshot({ path: path.join(outDir, String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 94 });
  }
  await browser.close(); server.close();
  console.log(`rendered ${n} frames -> ${outDir}`);
})();
