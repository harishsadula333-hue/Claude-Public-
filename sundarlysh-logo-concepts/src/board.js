const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2400, height: 1000 }, deviceScaleFactor: Number(process.argv[3] || 1) });
  await p.goto('file://' + __dirname + '/board.html');
  await p.waitForTimeout(300);
  await p.screenshot({ path: process.argv[2], fullPage: true });
  await b.close();
})();
