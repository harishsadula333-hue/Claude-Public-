// Parse a customer-typed date ("25-12-2026", "25/12", "25 Dec", "Dec 25 2026", "tomorrow").
// Returns { ok: true, iso: 'YYYY-MM-DD' } or { ok: false, reason }.

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// "today" in the business timezone as {y, m, d}
export function todayParts(now = new Date(), timeZone = 'Asia/Kolkata') {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(now).reduce((a, x) => ((a[x.type] = x.value), a), {});
  return { y: +p.year, m: +p.month, d: +p.day };
}

const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const valid = (y, m, d) => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

export function parseDate(input, now = new Date(), timeZone = 'Asia/Kolkata') {
  const t = todayParts(now, timeZone);
  const todayIso = iso(t.y, t.m, t.d);
  const s = String(input || '').trim().toLowerCase().replace(/(\d)(st|nd|rd|th)\b/g, '$1').replace(/,/g, ' ');
  let y, m, d, yearGiven = true;

  if (s === 'today' || s === 'tomorrow') {
    const base = new Date(Date.UTC(t.y, t.m - 1, t.d + (s === 'tomorrow' ? 1 : 0)));
    return { ok: true, iso: base.toISOString().slice(0, 10) };
  }
  let mt;
  if ((mt = s.match(/^(\d{1,2})\s*[-/.]\s*(\d{1,2})(?:\s*[-/.]\s*(\d{2,4}))?$/))) {          // 25-12-2026, 25/12
    d = +mt[1]; m = +mt[2]; y = mt[3] ? +mt[3] : undefined;
  } else if ((mt = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) {                               // 2026-12-25
    y = +mt[1]; m = +mt[2]; d = +mt[3];
  } else if ((mt = s.match(/^(\d{1,2})\s+([a-z]{3,9})\.?(?:\s+(\d{2,4}))?$/))) {               // 25 dec 2026
    d = +mt[1]; m = MONTHS.indexOf(mt[2].slice(0, 3)) + 1; y = mt[3] ? +mt[3] : undefined;
  } else if ((mt = s.match(/^([a-z]{3,9})\.?\s+(\d{1,2})(?:\s+(\d{2,4}))?$/))) {               // dec 25 2026
    m = MONTHS.indexOf(mt[1].slice(0, 3)) + 1; d = +mt[2]; y = mt[3] ? +mt[3] : undefined;
  } else {
    return { ok: false, reason: 'format' };
  }
  if (!m || m < 1 || m > 12) return { ok: false, reason: 'format' };
  if (y === undefined) {
    yearGiven = false;
    y = t.y;
    if (iso(y, m, d) < todayIso) y += 1;      // "25 Dec" means the next 25 Dec
  } else if (y < 100) y += 2000;
  if (!valid(y, m, d)) return { ok: false, reason: 'invalid' };
  const out = iso(y, m, d);
  if (out < todayIso) return { ok: false, reason: 'past' };
  if (y > t.y + 2) return { ok: false, reason: 'far' };
  return { ok: true, iso: out, yearGiven };
}

export function prettyDate(isoStr) {
  const [y, m, d] = isoStr.split('-').map(Number);
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const mon = MONTHS[m - 1][0].toUpperCase() + MONTHS[m - 1].slice(1);
  return `${wd}, ${d} ${mon} ${y}`;
}
