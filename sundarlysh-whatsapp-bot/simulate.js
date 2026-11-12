// Chat with the bot in your terminal. No WhatsApp account needed.
//   npm run simulate
// Type messages normally. When the bot shows numbered options, type the number to "tap" it.
// Special: /loc (share a location)  /admin (switch to the admin phone)  /me (back to customer)  /quit
import { createInterface } from 'node:readline/promises';
import { openStore } from './src/store.js';
import { createBot } from './src/flow.js';
import { toPayload } from './src/whatsapp.js';

const CUSTOMER = '919800000001', ADMIN = '919800000099';
const store = openStore(':memory:');
let options = [];
const c = { dim: '\x1b[2m', b: '\x1b[1m', g: '\x1b[32m', y: '\x1b[33m', r: '\x1b[0m' };
const wa = (s) => s.replace(/\*([^*]+)\*/g, `${c.b}$1${c.r}`).replace(/_([^_]+)_/g, `${c.dim}$1${c.r}`);

async function send(to, msg) {
  toPayload(to, msg);                                   // throws if a WhatsApp limit is broken
  const who = to === ADMIN ? `${c.y}[to admin]${c.r} ` : '';
  console.log(`\n${c.g}🤖 Sundarlysh${c.r} ${who}`);
  if (msg.type === 'template') { console.log(`(template ${msg.name}: ${msg.params.join(' | ')})`); return; }
  console.log(wa(msg.text));
  if (to !== current) return;
  options = [];
  if (msg.type === 'buttons') msg.buttons.forEach((b) => { options.push(b); console.log(`   ${c.y}[${options.length}]${c.r} ${b.title}`); });
  if (msg.type === 'list') {
    console.log(`   ${c.dim}── ${msg.button} ──${c.r}`);
    for (const s of msg.sections) {
      console.log(`   ${c.dim}${s.title}${c.r}`);
      for (const r of s.rows) { options.push(r); console.log(`   ${c.y}[${options.length}]${c.r} ${r.title}${r.description ? c.dim + ' · ' + r.description + c.r : ''}`); }
    }
  }
}

let current = CUSTOMER;
const bot = createBot({ store, send, adminNumbers: [ADMIN], log: { error: (...a) => console.log(c.dim + a.join(' ') + c.r) } });
const rl = createInterface({ input: process.stdin, output: process.stdout });
console.log(`${c.b}Sundarlysh WhatsApp bot simulator${c.r}. Say "hi" to start. (/loc /admin /me /quit)`);
const ask = () => process.stdout.write(`\n${c.b}You${current === ADMIN ? ' (admin)' : ''}:${c.r} `);
ask();
for await (const raw of rl) {
  const line = raw.trim();
  if (!process.stdin.isTTY) console.log(line);           // echo when input is piped
  if (line === '/quit') break;
  if (line === '/admin') { current = ADMIN; console.log('Now chatting as the admin phone. Try: bookings, confirm SL-1001'); ask(); continue; }
  if (line === '/me') { current = CUSTOMER; ask(); continue; }
  let input;
  if (line === '/loc') input = { kind: 'location', location: { latitude: 17.3313, longitude: 78.4675, name: 'Taj Falaknuma Palace', address: 'Engine Bowli, Hyderabad' } };
  else if (/^\d+$/.test(line) && options[+line - 1]) input = { kind: 'choice', id: options[+line - 1].id, title: options[+line - 1].title };
  else input = { kind: 'text', text: line };
  await bot.handle(current, current === ADMIN ? 'Team Sundarlysh' : 'Priya Sharma', input);
  ask();
}
rl.close();
