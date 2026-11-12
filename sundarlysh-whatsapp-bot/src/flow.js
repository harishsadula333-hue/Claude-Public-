// Conversation logic. createBot() returns handle(waId, profileName, input), which reads/writes the
// customer's session, sends replies through `send(to, message)` and records bookings in the store.
import { BUSINESS, CATEGORIES, SERVICES, TIME_SLOTS, GUEST_RANGES, SESSION_TIMEOUT_MIN, HANDOFF_HOURS } from './config.js';
import { parseDate, prettyDate } from './dates.js';

const STEPS = ['service', 'date', 'time', 'city', 'guests', 'venue', 'name', 'notes'];
const GREETINGS = new Set(['hi', 'hii', 'hiii', 'hello', 'hey', 'hola', 'namaste', 'menu', 'start', 'main menu', 'home']);
const FIELD_LABELS = { service: 'Service', date: 'Date', time: 'Time', city: 'City', guests: 'Guests', venue: 'Venue', name: 'Name', notes: 'Notes' };

const svc = (id) => SERVICES.find((s) => s.id === id);
const firstName = (n) => (n || '').trim().split(/\s+/)[0] || '';
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9+ ]/g, ' ').replace(/\s+/g, ' ').trim();
const fresh = () => ({ step: 'menu', draft: {}, editing: false });

export function createBot({ store, send, adminNumbers = [], adminTemplate = '', customerTemplate = '',
  templateLang = 'en', now = () => new Date(), log = console }) {

  const isAdmin = (waId) => adminNumbers.includes(String(waId).replace(/\D/g, ''));

  // ---------------------------------------------------------------- outgoing messages
  const mainMenu = (name, intro = true) => ({
    type: 'buttons',
    text: (intro
      ? `Namaste${name ? ' ' + firstName(name) : ''}! 🙏 Welcome to *${BUSINESS.name}*, ${BUSINESS.tagline}\n\n` +
        `We plan beautiful weddings and bring fun experience bars & workshops to parties, cafés and ` +
        `Christmas celebrations in ${BUSINESS.cities.join(' & ')}.\n\n`
      : '') + 'How can we help you today?',
    buttons: [
      { id: 'menu:book', title: '📅 Book an event' },
      { id: 'menu:services', title: '✨ Our services' },
      { id: 'menu:talk', title: '💬 Talk to us' },
    ],
  });

  const serviceList = (prefix, text, button) => ({
    type: 'list', text, button,
    sections: CATEGORIES.map((c) => ({
      title: c.title,
      rows: SERVICES.filter((s) => s.category === c.id).map((s) => ({ id: `${prefix}:${s.id}`, title: s.title, description: s.desc })),
    })).filter((s) => s.rows.length),
  });

  const people = (d) => (svc(d.serviceId)?.kind === 'workshop' ? 'participants' : 'guests');

  function prompt(step, s, profileName) {
    const d = s.draft;
    switch (step) {
      case 'service':
        return serviceList('svc', 'Lovely! 🌸 What would you like to book?', 'View services');
      case 'date':
        return { type: 'text', text: `📅 *${svc(d.serviceId)?.title}*, great choice!\n\nWhat date is the event? Type it like *25-12-2026* or *25 Dec*.` };
      case 'time':
        return { type: 'buttons', text: '⏰ What time of day do you prefer?', buttons: TIME_SLOTS.map((t) => ({ id: `time:${t.id}`, title: t.title })) };
      case 'city':
        return { type: 'buttons', text: '📍 Which city is the event in?', buttons: BUSINESS.cities.map((c) => ({ id: `city:${c}`, title: c })) };
      case 'guests':
        return { type: 'list', text: `👥 Roughly how many ${people(d)}?`, button: 'Select',
          sections: [{ title: people(d) === 'guests' ? 'Guests' : 'Participants', rows: GUEST_RANGES.map((g) => ({ id: `guests:${g.id}`, title: g.title })) }] };
      case 'venue':
        return { type: 'buttons', text: '🏛️ Where will it be? Type the venue or area, or share a location pin 📎.\n\nNo venue yet? Tap below.',
          buttons: [{ id: 'venue:skip', title: 'Not decided yet' }] };
      case 'name':
        return profileName
          ? { type: 'buttons', text: '👤 Whose name should we book under? Tap below or type a different name.',
              buttons: [{ id: 'name:profile', title: `Use ${profileName}`.slice(0, 20) }] }
          : { type: 'text', text: '👤 Whose name should we book under?' };
      case 'notes':
        return { type: 'buttons', text: '📝 Anything else we should know? Theme, budget, timings or special requests. Just type it here.',
          buttons: [{ id: 'notes:skip', title: "No, that's all" }] };
      case 'confirm':
        return { type: 'buttons', text: `Please check your booking request:\n\n${summary(d)}\n\nAll good?`,
          buttons: [{ id: 'confirm:yes', title: '✅ Confirm' }, { id: 'confirm:edit', title: '✏️ Edit' }, { id: 'confirm:cancel', title: 'Cancel' }] };
      case 'edit':
        return { type: 'list', text: 'What would you like to change?', button: 'Choose field',
          sections: [{ title: 'Edit', rows: STEPS.map((f) => ({ id: `edit:${f}`, title: FIELD_LABELS[f] })) }] };
    }
  }

  function summary(d) {
    const label = (arr, id) => arr.find((x) => x.id === id)?.title || id;
    return [
      `✨ *Service:* ${svc(d.serviceId)?.title}`,
      `📅 *Date:* ${prettyDate(d.date)}`,
      `⏰ *Time:* ${label(TIME_SLOTS, d.timeSlot)}`,
      `📍 *City:* ${d.city}`,
      `👥 *${people(d) === 'guests' ? 'Guests' : 'Participants'}:* ${label(GUEST_RANGES, d.guests)}`,
      `🏛️ *Venue:* ${d.venue || 'Not decided yet'}`,
      `👤 *Name:* ${d.name}`,
      ...(d.notes ? [`📝 *Notes:* ${d.notes}`] : []),
    ].join('\n');
  }

  const bookingText = (b) => [
    `*${b.ref}* · ${b.status.toUpperCase()}`,
    `${b.service_title} · ${prettyDate(b.event_date)} · ${TIME_SLOTS.find((t) => t.id === b.time_slot)?.title || b.time_slot}`,
    `${b.city} · ${GUEST_RANGES.find((g) => g.id === b.guests)?.title || b.guests} people`,
    `Venue: ${b.venue || 'Not decided'}`,
    `Name: ${b.name} · wa.me/${b.wa_id}`,
    ...(b.notes ? [`Notes: ${b.notes}`] : []),
  ].join('\n');

  // ---------------------------------------------------------------- sending helpers
  const reply = async (to, ...msgs) => { for (const m of msgs) await send(to, m); };

  async function sendWithFallback(to, text, template, params) {
    try { await send(to, { type: 'text', text }); return true; }
    catch (e) {
      if (template) {
        try { await send(to, { type: 'template', name: template, language: templateLang, params }); return true; }
        catch (e2) { log.error?.(`template to ${to} failed: ${e2.message}`); }
      } else log.error?.(`message to ${to} failed (${e.message}). Outside the 24h window? Set a template.`);
      return false;
    }
  }
  const notifyAdmins = (text, params) =>
    Promise.all(adminNumbers.map((a) => sendWithFallback(a, text, adminTemplate, params)));

  // ---------------------------------------------------------------- step input handling
  function matchChoice(step, input) {
    // accept a tap for this step, or typed text that clearly matches an option
    const id = input.kind === 'choice' ? input.id : null;
    const t = input.kind === 'text' ? norm(input.text) : '';
    const pick = (prefix, items, key = 'id', textMatch) => {
      if (id?.startsWith(prefix + ':')) {
        const v = id.slice(prefix.length + 1);
        return items.some((x) => x[key] === v) ? v : null;
      }
      if (t && textMatch) return textMatch(t);
      return null;
    };
    switch (step) {
      case 'service':
        return pick('svc', SERVICES, 'id', (t) => {
          const hits = SERVICES.filter((s) => norm(s.title).includes(t) || t.split(' ').some((w) => w.length > 3 && norm(s.title).includes(w)));
          return hits.length === 1 ? hits[0].id : null;
        });
      case 'time':
        return pick('time', TIME_SLOTS, 'id', (t) => TIME_SLOTS.find((x) => t.includes(x.id))?.id || null);
      case 'city':
        return pick('city', BUSINESS.cities.map((c) => ({ id: c })), 'id', (t) =>
          BUSINESS.cities.find((c) => t.includes(norm(c)) || (norm(c) === 'bengaluru' && /bangalore|blr/.test(t)) || (norm(c) === 'hyderabad' && /hyd/.test(t))) || null);
      case 'guests':
        return pick('guests', GUEST_RANGES, 'id', (t) => {
          const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
          if (!n) return null;
          return n <= 25 ? 'upto25' : n <= 50 ? '26_50' : n <= 100 ? '51_100' : n <= 250 ? '101_250' : '250plus';
        });
    }
    return null;
  }

  function advance(s) {
    if (s.editing) { s.editing = false; s.step = 'confirm'; return; }
    s.step = STEPS[STEPS.indexOf(s.step) + 1] || 'confirm';
  }

  // returns true if the input was consumed by the current step
  function applyStep(s, input, profileName) {
    const d = s.draft;
    switch (s.step) {
      case 'service': case 'time': case 'city': case 'guests': {
        const v = matchChoice(s.step, input);
        if (!v) return { ok: false };
        ({ service: () => (d.serviceId = v), time: () => (d.timeSlot = v), city: () => (d.city = v), guests: () => (d.guests = v) })[s.step]();
        return { ok: true };
      }
      case 'date': {
        if (input.kind !== 'text') return { ok: false };
        const r = parseDate(input.text, now(), BUSINESS.timezone);
        if (!r.ok) {
          const why = { past: 'That date has already passed.', far: 'We take bookings up to 2 years ahead.',
            invalid: "That date doesn't exist.", format: "I couldn't read that date." }[r.reason];
          return { ok: false, error: `${why} Please type it like *25-12-2026* or *25 Dec*.` };
        }
        d.date = r.iso; return { ok: true };
      }
      case 'venue':
        if (input.kind === 'choice' && input.id === 'venue:skip') { d.venue = ''; return { ok: true }; }
        if (input.kind === 'location') {
          const L = input.location;
          d.venue = [L.name, L.address].filter(Boolean).join(', ') || 'Shared location';
          if (L.latitude != null) d.venue += ` (https://maps.google.com/?q=${L.latitude},${L.longitude})`;
          return { ok: true };
        }
        if (input.kind === 'text' && input.text.trim()) { d.venue = input.text.trim().slice(0, 200); return { ok: true }; }
        return { ok: false };
      case 'name':
        if (input.kind === 'choice' && input.id === 'name:profile' && profileName) { d.name = profileName; return { ok: true }; }
        if (input.kind === 'text' && input.text.trim().length >= 2) { d.name = input.text.trim().slice(0, 80); return { ok: true }; }
        return { ok: false };
      case 'notes':
        if (input.kind === 'choice' && input.id === 'notes:skip') { d.notes = ''; return { ok: true }; }
        if (input.kind === 'text' && input.text.trim()) { d.notes = input.text.trim().slice(0, 500); return { ok: true }; }
        return { ok: false };
    }
    return { ok: false };
  }

  // ---------------------------------------------------------------- admin commands
  async function adminCommand(waId, text) {
    const t = text.trim();
    let m;
    if (/^admin$/i.test(t)) {
      await reply(waId, { type: 'text', text: '*Admin commands*\n• bookings: last 10 requests\n• booking SL-1001: details\n• confirm SL-1001: confirm & notify customer\n• decline SL-1001 reason: decline & notify customer' });
      return true;
    }
    if (/^(bookings|list)$/i.test(t)) {
      const rows = store.recentBookings(10);
      await reply(waId, { type: 'text', text: rows.length
        ? '*Latest booking requests*\n\n' + rows.map((b) => `${b.ref} · ${b.status} · ${prettyDate(b.event_date)} · ${b.service_title} · ${b.city} · ${b.name}`).join('\n')
        : 'No bookings yet.' });
      return true;
    }
    if ((m = t.match(/^booking\s+(SL-\d+)$/i))) {
      const b = store.getBooking(m[1]);
      await reply(waId, { type: 'text', text: b ? bookingText(b) : `No booking ${m[1].toUpperCase()} found.` });
      return true;
    }
    if ((m = t.match(/^(confirm|decline)\s+(SL-\d+)\s*(.*)$/i))) {
      const action = m[1].toLowerCase(), ref = m[2].toUpperCase(), reason = m[3].trim();
      const b = store.setStatus(ref, action === 'confirm' ? 'confirmed' : 'declined', now().getTime());
      if (!b) { await reply(waId, { type: 'text', text: `No booking ${ref} found.` }); return true; }
      const msg = action === 'confirm'
        ? `🎉 Great news, ${firstName(b.name)}! Your booking *${b.ref}* for *${b.service_title}* on ${prettyDate(b.event_date)} is *confirmed*. Our team will share the next steps here. Thank you for choosing ${BUSINESS.name}! 💖`
        : `Hi ${firstName(b.name)}, we're really sorry, but we can't take booking *${b.ref}* (${b.service_title}, ${prettyDate(b.event_date)})${reason ? `: ${reason}` : '.'}\n\nReply *MENU* to pick another date or service. We'd love to make it work!`;
      const delivered = await sendWithFallback(b.wa_id, msg, customerTemplate, [firstName(b.name), b.ref, action === 'confirm' ? 'confirmed' : 'not available']);
      await reply(waId, { type: 'text', text: `${ref} marked *${b.status}*. Customer ${delivered ? 'notified ✅' : 'could NOT be messaged ⚠️ (outside 24h window, so call them or set CUSTOMER_UPDATE_TEMPLATE)'}.` });
      return true;
    }
    return false;
  }

  // ---------------------------------------------------------------- main entry
  async function handle(waId, profileName, input) {
    const nowMs = now().getTime();
    let s = store.getSession(waId) || fresh();
    const text = input.kind === 'text' ? input.text.trim() : '';
    const word = norm(text);

    // admins can manage bookings from WhatsApp
    if (text && isAdmin(waId) && (await adminCommand(waId, text))) return;

    // human handoff: stay quiet unless they ask for the menu or tap a bot button
    if (s.handoffUntil && s.handoffUntil > nowMs) {
      if (!(GREETINGS.has(word) || input.kind === 'choice')) return;
      s.handoffUntil = 0;
    }

    // stale half-finished booking
    const stale = s._updatedAt && nowMs - s._updatedAt > SESSION_TIMEOUT_MIN * 60e3;
    if (stale && s.step !== 'menu' && input.kind !== 'choice') s = fresh();

    const save = () => store.saveSession(waId, s, nowMs);
    const startBooking = async (serviceId) => {
      s = { ...fresh(), handoffUntil: 0, draft: {} };
      if (serviceId && svc(serviceId)) { s.draft.serviceId = serviceId; s.step = 'date'; }
      else s.step = 'service';
      save(); await reply(waId, prompt(s.step, s, profileName));
    };

    // ---- global intents (taps work any time, even on an old message)
    const id = input.kind === 'choice' ? input.id : '';
    if (GREETINGS.has(word) || id === 'menu:main') { s = fresh(); save(); return reply(waId, mainMenu(profileName, id !== 'menu:main')); }
    if (id === 'menu:book' || word === 'book' || word === 'book an event') return startBooking();
    if (id.startsWith('book:')) return startBooking(id.slice(5));
    if (id.startsWith('svc:') && !['service'].includes(s.step) && !s.editing) return startBooking(id.slice(4));
    if (id === 'menu:services' || word === 'services' || word === 'our services') {
      s = fresh(); save();
      return reply(waId, serviceList('info', `✨ *Our services*\nAvailable in ${BUSINESS.cities.join(' & ')}. Tap one to learn more.`, 'View services'));
    }
    if (id.startsWith('info:')) {
      const v = svc(id.slice(5));
      if (!v) return reply(waId, mainMenu(profileName, false));
      return reply(waId, { type: 'buttons', text: `*${v.title}*\n${v.desc}.\n\n📍 ${BUSINESS.cities.join(' & ')}`,
        buttons: [{ id: `book:${v.id}`, title: '📅 Book this' }, { id: 'menu:services', title: 'Other services' }, { id: 'menu:main', title: 'Main menu' }] });
    }
    if (id === 'menu:talk' || ['talk', 'agent', 'human', 'call me', 'talk to us'].includes(word)) {
      s = { ...fresh(), handoffUntil: nowMs + HANDOFF_HOURS * 3600e3 }; save();
      await reply(waId, { type: 'text', text: `Sure! 💬 Someone from our team will reach out to you here shortly${BUSINESS.responseTime ? ` (${BUSINESS.responseTime})` : ''}.\n\nType *MENU* any time to come back to the booking assistant.` });
      await notifyAdmins(`💬 *Customer wants to talk*\n${profileName || 'Customer'} · wa.me/${waId}`, ['Chat request', `${profileName || ''} wa.me/${waId}`]);
      return;
    }
    if (['my bookings', 'status', 'my booking'].includes(word)) {
      const rows = store.customerBookings(waId, 5);
      return reply(waId, { type: 'text', text: rows.length
        ? '*Your booking requests*\n\n' + rows.map((b) => `${b.ref} · ${b.service_title} · ${prettyDate(b.event_date)} · *${b.status}*`).join('\n')
        : "You don't have any bookings with us yet. Type *BOOK* to make one!" });
    }
    if (['cancel', 'stop', 'start over'].includes(word) && s.step !== 'menu') {
      s = fresh(); save();
      return reply(waId, { type: 'text', text: 'No problem, I have cancelled this booking request. Type *MENU* whenever you are ready. 🌸' });
    }

    // ---- confirm / edit screens
    if (s.step === 'confirm') {
      if (id === 'confirm:yes' || ['yes', 'y', 'ok', 'okay', 'confirm', 'done', 'yes confirm'].includes(word)) {
        const d = s.draft;
        const b = store.createBooking({ waId, name: d.name, serviceId: d.serviceId, serviceTitle: svc(d.serviceId).title,
          date: d.date, timeSlot: d.timeSlot, city: d.city, guests: d.guests, venue: d.venue, notes: d.notes }, nowMs);
        s = { ...fresh(), lastBookingRef: b.ref }; save();
        await reply(waId, {
          type: 'buttons',
          text: `🎉 Thank you, ${firstName(d.name)}! Your booking request *${b.ref}* has been received.\n\n` +
            `Our team will contact you ${BUSINESS.responseTime} to confirm availability and share pricing. 💖\n\n_${BUSINESS.name}, ${BUSINESS.tagline}_`,
          buttons: [{ id: 'menu:book', title: 'Book another' }, { id: 'menu:main', title: 'Main menu' }],
        });
        await notifyAdmins(`🔔 *New booking request*\n\n${bookingText(b)}\n\nReply "confirm ${b.ref}" or "decline ${b.ref} reason".`,
          [b.ref, `${b.service_title}, ${prettyDate(b.event_date)}, ${b.city}, ${b.name} (wa.me/${b.wa_id})`]);
        return;
      }
      if (id === 'confirm:edit') { s.step = 'edit'; save(); return reply(waId, prompt('edit', s, profileName)); }
      if (id === 'confirm:cancel') { s = fresh(); save(); return reply(waId, { type: 'text', text: 'Booking request cancelled. Type *MENU* whenever you are ready. 🌸' }); }
      return reply(waId, prompt('confirm', s, profileName));
    }
    if (s.step === 'edit') {
      const f = id.startsWith('edit:') ? id.slice(5) : null;
      if (!STEPS.includes(f)) return reply(waId, prompt('edit', s, profileName));
      s.step = f; s.editing = true; save();
      return reply(waId, prompt(f, s, profileName));
    }

    // ---- booking steps
    if (STEPS.includes(s.step)) {
      const r = applyStep(s, input, profileName);
      if (!r.ok) {
        const hint = r.error || (input.kind === 'other' ? 'I can only read text messages and taps for now. 🙂' : 'Sorry, I didn\'t catch that.');
        return reply(waId, { type: 'text', text: hint }, prompt(s.step, s, profileName));
      }
      advance(s); save();
      return reply(waId, prompt(s.step, s, profileName));
    }

    // ---- idle: anything else shows the menu
    s = fresh(); save();
    return reply(waId, mainMenu(profileName, true));
  }

  return { handle, summary, isAdmin };
}
