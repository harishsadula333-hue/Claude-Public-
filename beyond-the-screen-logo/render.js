// node render.js -> PNG variants of the logo
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = fs.readFileSync(path.join(__dirname, 'logo.html'), 'utf8');
const variants = {
  'beyond-the-screen-logo.png':  { dy: -60, word: true },     // full logo with name
  'beyond-the-screen-icon.png':  { dy: 20, word: false },     // profile picture (round-crop safe)
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  for (const [out, v] of Object.entries(variants)) {
    let html = base.replace('__DY__', v.dy).replace('__GX__', 630).replace('__GY__', 250);
    if (!v.word) html = html.replace(/<g id="word">[\s\S]*?<\/g>/, '');
    fs.writeFileSync(path.join(__dirname, '_tmp.html'), html);
    await p.goto('file://' + path.join(__dirname, '_tmp.html')); await p.evaluate(() => document.fonts.ready);
    await p.locator('#logo').screenshot({ path: path.join(__dirname, out) });
    if (out.includes('logo')) fs.writeFileSync(path.join(__dirname, 'beyond-the-screen-logo.svg'), html.match(/<svg[\s\S]*<\/svg>/)[0]);
  }
  fs.unlinkSync(path.join(__dirname, '_tmp.html')); await b.close();
})();
