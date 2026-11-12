import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { openStore } from '../src/store.js';
import { createBot } from '../src/flow.js';
import { toPayload, parseIncoming, verifySignature, createSender } from '../src/whatsapp.js';
import { parseDate } from '../src/dates.js';
import { createApp } from '../src/server.js';
import { SERVICES } from '../src/config.js';

const NOW = new Date('2026-11-12T06:00:00Z');      // 11:30 IST
const CUST = '919811111111', ADMIN = '919899999999';

function harness(extra = {}) {
  const store = openStore(':memory:');
  const sent = [];
  const send = async (to, msg) => { toPayload(to, msg); sent.push({ to, msg }); };
  let clock = NOW.getTime();
  const bot = createBot({ store, send, adminNumbers: [ADMIN], now: () => new Date(clock), log: { error() {} }, ...extra });
  const say = (text, who = CUST) => bot.handle(who, 'Priya Sharma', { kind: 'text', text });
  const tap = (id, who = CUST) => bot.handle(who, 'Priya Sharma', { kind: 'choice', id, title: id });
  const last = (who = CUST) => [...sent].reverse().find((s) => s.to === who)?.msg;
  return { store, sent, bot, say, tap, last, advance: (ms) => (clock += ms) };
}

test('date parsing', () => {
  assert.equal(parseDate('25-12-2026', NOW).iso, '2026-12-25');
  assert.equal(parseDate('25/12', NOW).iso, '2026-12-25');
  assert.equal(parseDate('25th Dec', NOW).iso, '2026-12-25');
  assert.equal(parseDate('Dec 25 2027', NOW).iso, '2027-12-25');
  assert.equal(parseDate('5 jan', NOW).iso, '2027-01-05');           // next occurrence
  assert.equal(parseDate('tomorrow', NOW).iso, '2026-11-13');
  assert.equal(parseDate('01-01-2026', NOW).reason, 'past');
  assert.equal(parseDate('31-02-2027', NOW).reason, 'invalid');
  assert.equal(parseDate('next week sometime', NOW).reason, 'format');
});

test('every message the bot can send fits WhatsApp limits', async () => {
  // harness.send runs toPayload, which throws on any limit violation
  const h = harness();
  await h.say('hi'); await h.tap('menu:services');
  for (const s of SERVICES) await h.tap(`info:${s.id}`);
  await h.tap('menu:book'); await h.tap('svc:ubtan_bar'); await h.say('25 Dec');
  await h.tap('time:evening'); await h.tap('city:Hyderabad'); await h.tap('guests:51_100');
  await h.tap('venue:skip'); await h.tap('name:profile'); await h.tap('notes:skip');
  await h.tap('confirm:edit');
  assert.ok(h.sent.length > 15);
});

test('full booking via taps creates a booking and alerts the admin', async () => {
  const h = harness();
  await h.say('Hi');
  assert.match(h.last().text, /Welcome to \*Sundarlysh Events\*/);
  await h.tap('menu:book');
  assert.equal(h.last().type, 'list');
  await h.tap('svc:mehendi_glitter');
  await h.say('25-12-2026');
  await h.tap('time:evening');
  await h.tap('city:Bengaluru');
  await h.tap('guests:26_50');
  await h.bot.handle(CUST, 'Priya Sharma', { kind: 'location', location: { latitude: 12.97, longitude: 77.59, name: 'Taj West End' } });
  await h.tap('name:profile');
  await h.say('Pastel theme, around 6pm please');
  const conf = h.last();
  assert.equal(conf.type, 'buttons');
  assert.match(conf.text, /Mehendi & Glitter Bar/);
  assert.match(conf.text, /Fri, 25 Dec 2026/);
  assert.match(conf.text, /Taj West End/);
  await h.tap('confirm:yes');
  assert.match(h.last().text, /SL-1001/);
  const b = h.store.getBooking('SL-1001');
  assert.equal(b.city, 'Bengaluru'); assert.equal(b.guests, '26_50'); assert.equal(b.status, 'pending');
  assert.equal(b.notes, 'Pastel theme, around 6pm please');
  const alert = h.last(ADMIN);
  assert.match(alert.text, /New booking request/); assert.match(alert.text, /wa\.me\/919811111111/);
});

test('typed answers are understood and bad input re-prompts', async () => {
  const h = harness();
  await h.say('book');
  await h.say('ubtan');                                   // typed service
  assert.match(h.last().text, /The Ubtan Bar/);
  await h.say('yesterday-ish');
  assert.equal(h.sent.at(-2).msg.text.includes("couldn't read that date"), true);
  await h.say('01-01-2026');
  assert.match(h.sent.at(-2).msg.text, /already passed/);
  await h.say('20 Dec');
  await h.say('evening'); await h.say('bangalore'); await h.say('around 40 people');
  assert.equal(h.store.getSession(CUST).draft.guests, '26_50');
  assert.equal(h.store.getSession(CUST).draft.city, 'Bengaluru');
  await h.bot.handle(CUST, '', { kind: 'other', type: 'sticker' });
  assert.match(h.sent.at(-2).msg.text, /only read text/);
});

test('edit a field from the summary and return to confirm', async () => {
  const h = harness();
  await h.tap('book:cake_paint'); await h.say('24 Dec'); await h.tap('time:morning'); await h.tap('city:Hyderabad');
  await h.tap('guests:upto25'); await h.say('Our home in Jubilee Hills'); await h.say('Rahul'); await h.tap('notes:skip');
  assert.match(h.last().text, /Participants/);            // workshop wording
  await h.tap('confirm:edit'); await h.tap('edit:city'); await h.tap('city:Bengaluru');
  assert.match(h.last().text, /City:\* Bengaluru/);
  assert.match(h.last().text, /Name:\* Rahul/);
  await h.say('Yes');                                     // typed confirmation works too
  assert.match(h.last().text, /SL-1001/);
});

test('cancel, handoff silence, and menu recovery', async () => {
  const h = harness();
  await h.tap('menu:book'); await h.say('cancel');
  assert.match(h.last().text, /cancelled/);
  await h.tap('menu:talk');
  assert.match(h.last(ADMIN).text, /wants to talk/);
  const toCustomer = () => h.sent.filter((s) => s.to === CUST).length;
  const before = toCustomer();
  await h.say('hello can someone call me?');               // bot stays quiet during handoff…
  await h.say('when will you call');
  assert.equal(toCustomer(), before);
  await h.say('menu');                                     // …until they ask for the menu
  assert.match(h.last().text, /How can we help/);
});

test('stale half-finished bookings reset after an hour', async () => {
  const h = harness();
  await h.tap('menu:book'); await h.tap('svc:bedazzle');
  h.advance(2 * 3600e3);
  await h.say('25 Dec');
  assert.match(h.last().text, /How can we help/);
});

test('admin commands: list, details, confirm & decline notify the customer', async () => {
  const h = harness();
  await h.tap('book:pipe_tree'); await h.say('20-12-2026'); await h.tap('time:afternoon'); await h.tap('city:Hyderabad');
  await h.tap('guests:upto25'); await h.tap('venue:skip'); await h.tap('name:profile'); await h.tap('notes:skip'); await h.tap('confirm:yes');
  await h.say('bookings', ADMIN);
  assert.match(h.last(ADMIN).text, /SL-1001 · pending/);
  await h.say('booking sl-1001', ADMIN);
  assert.match(h.last(ADMIN).text, /Pipe-Cleaner Xmas Trees/);
  await h.say('confirm SL-1001', ADMIN);
  assert.match(h.last().text, /is \*confirmed\*/);
  assert.match(h.last(ADMIN).text, /marked \*confirmed\*.*notified/s);
  await h.say('decline SL-1001 fully booked that day', ADMIN);
  assert.match(h.last().text, /fully booked that day/);
  assert.equal(h.store.getBooking('SL-1001').status, 'declined');
  await h.say('my bookings');
  assert.match(h.last().text, /SL-1001.*declined/);
});

test('admin alert falls back to a template when free text is refused', async () => {
  const store = openStore(':memory:'); const sent = [];
  const send = async (to, msg) => {
    if (to === ADMIN && msg.type === 'text') { const e = new Error('re-engagement'); e.code = 131047; throw e; }
    sent.push({ to, msg });
  };
  const bot = createBot({ store, send, adminNumbers: [ADMIN], adminTemplate: 'new_booking_alert', now: () => NOW, log: { error() {} } });
  const tap = (id) => bot.handle(CUST, 'Priya', { kind: 'choice', id });
  await tap('book:art_3d'); await bot.handle(CUST, 'Priya', { kind: 'text', text: '28 Dec' });
  for (const id of ['time:evening', 'city:Bengaluru', 'guests:upto25', 'venue:skip', 'name:profile', 'notes:skip', 'confirm:yes']) await tap(id);
  const t = sent.find((s) => s.to === ADMIN);
  assert.equal(t.msg.type, 'template'); assert.equal(t.msg.name, 'new_booking_alert'); assert.equal(t.msg.params[0], 'SL-1001');
});

test('webhook parsing and signature verification', () => {
  assert.deepEqual(parseIncoming({ type: 'text', text: { body: 'hi' } }), { kind: 'text', text: 'hi' });
  assert.deepEqual(parseIncoming({ type: 'interactive', interactive: { type: 'list_reply', list_reply: { id: 'svc:x', title: 'X' } } }), { kind: 'choice', id: 'svc:x', title: 'X' });
  const raw = Buffer.from('{"a":1}');
  const sig = 'sha256=' + createHmac('sha256', 'secret').update(raw).digest('hex');
  assert.equal(verifySignature(raw, sig, 'secret'), true);
  assert.equal(verifySignature(raw, sig, 'other'), false);
  assert.equal(verifySignature(raw, undefined, 'secret'), false);
});

test('sender posts the right request to the Graph API', async () => {
  let call;
  const send = createSender({ accessToken: 'TKN', phoneNumberId: '123', graphVersion: 'v24.0',
    fetchImpl: async (url, opts) => { call = { url, opts }; return { ok: true, json: async () => ({ messages: [{ id: 'wamid.1' }] }) }; } });
  await send(CUST, { type: 'buttons', text: 'Pick', buttons: [{ id: 'a', title: 'A very long button title here' }] });
  assert.equal(call.url, 'https://graph.facebook.com/v24.0/123/messages');
  assert.equal(call.opts.headers.Authorization, 'Bearer TKN');
  const body = JSON.parse(call.opts.body);
  assert.equal(body.interactive.action.buttons[0].reply.title.length, 20);
});

test('HTTP server: verify handshake, signed webhook, dedupe, dashboard auth', async () => {
  const sent = [];
  const cfg = { verifyToken: 'vt', appSecret: 'sec', adminNumbers: [ADMIN], adminToken: 'dash', dbPath: ':memory:' };
  const { server, store } = createApp({ cfg, store: openStore(':memory:'), send: async (to, msg) => sent.push({ to, msg }), log: { error() {} } });
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    let r = await fetch(`${base}/webhook?hub.mode=subscribe&hub.verify_token=vt&hub.challenge=42`);
    assert.equal(await r.text(), '42');
    r = await fetch(`${base}/webhook?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=42`);
    assert.equal(r.status, 403);

    const payload = JSON.stringify({ entry: [{ changes: [{ value: {
      contacts: [{ wa_id: CUST, profile: { name: 'Priya' } }],
      messages: [{ from: CUST, id: 'wamid.A', type: 'text', text: { body: 'hi' } }] } }] }] });
    const sig = 'sha256=' + createHmac('sha256', 'sec').update(payload).digest('hex');
    r = await fetch(`${base}/webhook`, { method: 'POST', body: payload, headers: { 'x-hub-signature-256': 'sha256=bad' } });
    assert.equal(r.status, 401);
    for (let i = 0; i < 2; i++) {                                   // same message delivered twice
      r = await fetch(`${base}/webhook`, { method: 'POST', body: payload, headers: { 'x-hub-signature-256': sig } });
      assert.equal(r.status, 200);
    }
    await new Promise((res) => setTimeout(res, 50));
    assert.equal(sent.length, 1);
    assert.match(sent[0].msg.text, /Namaste Priya/);

    assert.equal((await fetch(`${base}/admin`)).status, 401);
    store.createBooking({ waId: CUST, name: 'Priya <b>', serviceId: 'ubtan_bar', serviceTitle: 'The Ubtan Bar', date: '2026-12-25',
      timeSlot: 'evening', city: 'Hyderabad', guests: '51_100', venue: '', notes: '' });
    const html = await (await fetch(`${base}/admin?token=dash`)).text();
    assert.match(html, /SL-1001/); assert.match(html, /Priya &lt;b&gt;/);
    const csv = await (await fetch(`${base}/admin/bookings.csv?token=dash`)).text();
    assert.match(csv, /^ref,status/); assert.match(csv, /"SL-1001","pending","The Ubtan Bar"/);
  } finally { server.close(); }
});
