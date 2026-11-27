// Deterministic gold bokeh so every render is identical.
(function () {
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  document.querySelectorAll('.particles').forEach(function (box) {
    const rnd = mulberry32(parseInt(box.dataset.seed || '7', 10));
    const n = parseInt(box.dataset.count || '46', 10);
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div');
      d.className = 'p';
      const size = 6 + rnd() * 26;
      const dur = 5 + rnd() * 7;
      d.style.width = d.style.height = size + 'px';
      d.style.left = (rnd() * 1080) + 'px';
      d.style.top = (500 + rnd() * 1500) + 'px';
      d.style.animationDuration = dur + 's';
      d.style.animationDelay = (-rnd() * dur) + 's';
      d.style.setProperty('--o', (0.25 + rnd() * 0.6).toFixed(2));
      if (size > 24) d.style.filter = 'blur(2px)';
      box.appendChild(d);
    }
  });
})();
