// HTTP server: WhatsApp webhook + a small password-protected bookings dashboard.
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { env, BUSINESS, TIME_SLOTS, GUEST_RANGES } from './config.js';
import { openStore } from './store.js';
import { createSender, parseIncoming, verifySignature } from './whatsapp.js';
import { createBot } from './flow.js';
import { prettyDate } from './dates.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const csvCell = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;

export function createApp({ cfg = env(), store, send, log = console } = {}) {
  store ??= openStore(cfg.dbPath);
  send ??= createSender({ accessToken: cfg.accessToken, phoneNumberId: cfg.phoneNumberId, graphVersion: cfg.graphVersion, log });
  const bot = createBot({ store, send, adminNumbers: cfg.adminNumbers, adminTemplate: cfg.adminTemplate,
    customerTemplate: cfg.customerTemplate, templateLang: cfg.templateLang, log });

  async function processWebhook(body) {
    for (const entry of body?.entry || []) {
      for (const change of entry.changes || []) {
        const v = change.value || {};
        const names = Object.fromEntries((v.contacts || []).map((c) => [c.wa_id, c.profile?.name || '']));
        for (const m of v.messages || []) {
          if (!store.markProcessed(m.id)) continue;           // duplicate delivery
          try { await bot.handle(m.from, names[m.from] || '', parseIncoming(m)); }
          catch (e) { log.error?.(`handling message from ${m.from} failed:`, e); }
        }
      }
    }
  }

  const authed = (url) => cfg.adminToken && url.searchParams.get('token') === cfg.adminToken;

  function dashboard() {
    const rows = store.allBookings();
    const label = (arr, id) => arr.find((x) => x.id === id)?.title || id;
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(BUSINESS.name)} bookings</title><style>
body{font-family:system-ui,sans-serif;margin:0;padding:16px;background:#f9f5f2;color:#2e2220}
h1{font-size:20px;margin:0 0 12px}table{border-collapse:collapse;width:100%;background:#fff;font-size:14px}
th,td{padding:8px 10px;border-bottom:1px solid #eadfd8;text-align:left;vertical-align:top}th{background:#efe3dc}
.pending{color:#a8685c;font-weight:600}.confirmed{color:#2c7a4b;font-weight:600}.declined{color:#888}
.wrap{overflow-x:auto}a{color:#a8685c}</style></head><body>
<h1>${esc(BUSINESS.name)}: booking requests (${rows.length})</h1><div class="wrap"><table><tr>
<th>Ref</th><th>Status</th><th>Service</th><th>Date</th><th>Time</th><th>City</th><th>People</th><th>Venue</th><th>Name</th><th>WhatsApp</th><th>Notes</th><th>Received</th></tr>
${rows.map((b) => `<tr><td>${esc(b.ref)}</td><td class="${esc(b.status)}">${esc(b.status)}</td><td>${esc(b.service_title)}</td>
<td>${esc(prettyDate(b.event_date))}</td><td>${esc(label(TIME_SLOTS, b.time_slot))}</td><td>${esc(b.city)}</td>
<td>${esc(label(GUEST_RANGES, b.guests))}</td><td>${esc(b.venue)}</td><td>${esc(b.name)}</td>
<td><a href="https://wa.me/${esc(b.wa_id)}">+${esc(b.wa_id)}</a></td><td>${esc(b.notes)}</td>
<td>${esc(new Date(b.created_at).toLocaleString('en-IN', { timeZone: BUSINESS.timezone }))}</td></tr>`).join('')}
</table></div></body></html>`;
  }

  function csv() {
    const cols = ['ref', 'status', 'service_title', 'event_date', 'time_slot', 'city', 'guests', 'venue', 'name', 'wa_id', 'notes', 'created_at'];
    return [cols.join(','), ...store.allBookings().map((b) =>
      cols.map((c) => csvCell(c === 'created_at' ? new Date(b[c]).toISOString() : b[c])).join(','))].join('\n');
  }

  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const send_ = (code, body, type = 'text/plain') => { res.writeHead(code, { 'Content-Type': type }); res.end(body); };

    if (req.method === 'GET' && url.pathname === '/webhook') {          // Meta verification handshake
      const ok = url.searchParams.get('hub.mode') === 'subscribe' && cfg.verifyToken &&
        url.searchParams.get('hub.verify_token') === cfg.verifyToken;
      return ok ? send_(200, url.searchParams.get('hub.challenge') || '') : send_(403, 'Forbidden');
    }
    if (req.method === 'POST' && url.pathname === '/webhook') {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        const raw = Buffer.concat(chunks);
        if (!verifySignature(raw, req.headers['x-hub-signature-256'], cfg.appSecret)) return send_(401, 'Bad signature');
        let body; try { body = JSON.parse(raw.toString('utf8')); } catch { return send_(400, 'Bad JSON'); }
        send_(200, 'OK');                                               // acknowledge fast, then process
        processWebhook(body).catch((e) => log.error?.('webhook processing failed', e));
      });
      return;
    }
    if (req.method === 'GET' && url.pathname === '/health') return send_(200, 'ok');
    if (req.method === 'GET' && url.pathname === '/admin') return authed(url) ? send_(200, dashboard(), 'text/html; charset=utf-8') : send_(401, 'Unauthorized');
    if (req.method === 'GET' && url.pathname === '/admin/bookings.csv') {
      if (!authed(url)) return send_(401, 'Unauthorized');
      res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="sundarlysh-bookings.csv"' });
      return res.end(csv());
    }
    send_(404, 'Not found');
  });

  return { server, store, bot, processWebhook };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cfg = env();
  const missing = ['verifyToken', 'accessToken', 'phoneNumberId', 'appSecret'].filter((k) => !cfg[k]);
  if (missing.length) console.warn(`⚠️  Missing settings: ${missing.join(', ')}. See .env.example`);
  const { server } = createApp({ cfg });
  server.listen(cfg.port, () => console.log(`Sundarlysh WhatsApp bot listening on :${cfg.port}`));
}
