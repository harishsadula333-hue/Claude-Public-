// WhatsApp Cloud API: turn the bot's neutral message objects into API payloads and send them.
// Message shapes produced by flow.js:
//   { type: 'text', text }
//   { type: 'buttons', text, buttons: [{ id, title }], header?, footer? }       (≤ 3 buttons)
//   { type: 'list', text, button, sections: [{ title, rows: [{ id, title, description? }] }], header?, footer? }
//   { type: 'template', name, language, params: [string] }
import { createHmac, timingSafeEqual } from 'node:crypto';

const cut = (s, n) => {
  s = String(s ?? '');
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
};

export function toPayload(to, msg) {
  const base = { messaging_product: 'whatsapp', recipient_type: 'individual', to };
  const extras = (i) => {
    if (msg.header) i.header = { type: 'text', text: cut(msg.header, 60) };
    if (msg.footer) i.footer = { text: cut(msg.footer, 60) };
    return i;
  };
  switch (msg.type) {
    case 'text':
      return { ...base, type: 'text', text: { body: cut(msg.text, 4096), preview_url: false } };
    case 'buttons':
      if (!msg.buttons?.length || msg.buttons.length > 3) throw new Error('buttons: need 1–3');
      return { ...base, type: 'interactive', interactive: extras({
        type: 'button', body: { text: cut(msg.text, 1024) },
        action: { buttons: msg.buttons.map((b) => ({ type: 'reply', reply: { id: cut(b.id, 256), title: cut(b.title, 20) } })) },
      }) };
    case 'list': {
      const rows = msg.sections.reduce((n, s) => n + s.rows.length, 0);
      if (rows < 1 || rows > 10) throw new Error(`list: need 1–10 rows, got ${rows}`);
      return { ...base, type: 'interactive', interactive: extras({
        type: 'list', body: { text: cut(msg.text, 1024) },
        action: {
          button: cut(msg.button || 'Choose', 20),
          sections: msg.sections.map((s) => ({
            title: cut(s.title, 24),
            rows: s.rows.map((r) => ({ id: cut(r.id, 200), title: cut(r.title, 24),
              ...(r.description ? { description: cut(r.description, 72) } : {}) })),
          })),
        },
      }) };
    }
    case 'template':
      return { ...base, type: 'template', template: {
        name: msg.name, language: { code: msg.language || 'en' },
        components: msg.params?.length
          ? [{ type: 'body', parameters: msg.params.map((t) => ({ type: 'text', text: cut(t, 1000) })) }] : [],
      } };
    default:
      throw new Error(`unknown message type ${msg.type}`);
  }
}

export function createSender({ accessToken, phoneNumberId, graphVersion = 'v24.0', fetchImpl = fetch, log = console }) {
  const url = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`;
  return async function send(to, msg) {
    const payload = toPayload(to, msg);
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(`WhatsApp API ${res.status}: ${body?.error?.message || 'error'}`);
      err.code = body?.error?.code; err.status = res.status;
      log.error?.(err.message, JSON.stringify(body?.error || {}));
      throw err;
    }
    return body;
  };
}

// Normalise one webhook message into { kind, text?, id?, title?, location? }
export function parseIncoming(m) {
  switch (m.type) {
    case 'text': return { kind: 'text', text: m.text?.body || '' };
    case 'interactive': {
      const r = m.interactive?.button_reply || m.interactive?.list_reply;
      return r ? { kind: 'choice', id: r.id, title: r.title } : { kind: 'other' };
    }
    case 'button': return { kind: 'text', text: m.button?.text || '' };   // template quick-reply
    case 'location': return { kind: 'location', location: m.location || {} };
    default: return { kind: 'other', type: m.type };
  }
}

// Verify the X-Hub-Signature-256 header Meta adds to every webhook POST.
export function verifySignature(rawBody, header, appSecret) {
  if (!appSecret) return true;            // not configured (local testing only)
  if (!header || !header.startsWith('sha256=')) return false;
  const expected = Buffer.from('sha256=' + createHmac('sha256', appSecret).update(rawBody).digest('hex'));
  const got = Buffer.from(header);
  return expected.length === got.length && timingSafeEqual(expected, got);
}
