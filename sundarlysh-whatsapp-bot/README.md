# Sundarlysh Events – WhatsApp booking bot

A WhatsApp Business bot that lets customers book Sundarlysh services by tapping buttons and lists in WhatsApp.
It runs on Meta's official **WhatsApp Cloud API**. It has **zero dependencies**: Node.js 22+ only, using the built-in SQLite.

## What customers see

```
Customer: hi
Bot:      Namaste Priya! 🙏 Welcome to Sundarlysh Events, Care with Style ✨ …
          [📅 Book an event] [✨ Our services] [💬 Talk to us]
```

**Book an event** walks through, one tap at a time:

1. **Service:** list of all 10 offerings (Wedding Planning & Décor, Ubtan Bar, Mehendi & Glitter Bar, Decoden Frosting Bar, Sand Candle Making, Bedazzle, 3D Art, Cake & Paint, Mini Canvas Tree Lights, Pipe-Cleaner Xmas Trees)
2. **Date:** typed: `25-12-2026`, `25/12`, `25 Dec`, `tomorrow` (past/invalid dates are rejected politely)
3. **Time:** Morning / Afternoon / Evening
4. **City:** Bengaluru / Hyderabad
5. **Guests:** Up to 25 · 26–50 · 51–100 · 101–250 · 250+ (says "participants" for workshops)
6. **Venue:** typed, a shared location pin, or "Not decided yet"
7. **Name:** one tap to use their WhatsApp name, or type another
8. **Notes:** theme, budget, timings (optional)
9. **Summary** → ✅ Confirm · ✏️ Edit (change any single field) · Cancel

On confirm the customer gets a reference like **SL-1001**, and the team gets an instant WhatsApp alert.

It also handles:
- **Our services:** a catalogue with a "Book this" button on each service.
- **Talk to us:** alerts the team with the customer's number, and the bot goes quiet for 12 hours so a person can take over. The customer can type `MENU` to come back.
- **Typed answers:** "hyderabad", "bangalore", "evening", "around 40 people" and "ubtan" are all understood.
- **Keywords:** `MENU` / `hi` (main menu), `BOOK`, `CANCEL`, `MY BOOKINGS` (status of their requests).
- **Stale sessions:** half-finished bookings reset after 60 minutes.

## What the Sundarlysh team gets

**WhatsApp alerts and commands** (from any number listed in `ADMIN_NUMBERS`):

| Send | Does |
|---|---|
| `bookings` | latest 10 requests |
| `booking SL-1001` | full details |
| `confirm SL-1001` | marks confirmed and messages the customer 🎉 |
| `decline SL-1001 fully booked that day` | marks declined and messages the customer politely |
| `admin` | shows these commands |

**Dashboard:** `https://<your-server>/admin?token=<ADMIN_DASHBOARD_TOKEN>` shows all bookings in a table with click-to-chat links.
**Excel/CSV export:** `https://<your-server>/admin/bookings.csv?token=<ADMIN_DASHBOARD_TOKEN>`

## Try it right now (no WhatsApp account needed)

```bash
npm run simulate      # chat with the bot in the terminal; type numbers to tap buttons
npm test              # 12 automated tests
```

## Going live: step by step

### 1. Meta setup (about 30 minutes)
1. Go to **developers.facebook.com** → *My Apps* → **Create app** → type **Business** → add the **WhatsApp** product.
2. Link (or create) the Sundarlysh **Meta Business Portfolio**.
3. **WhatsApp → API Setup**: add the business phone number and verify it by SMS or call.
   - ⚠️ Use a number **not** currently logged into the WhatsApp / WhatsApp Business app, or use Meta's *"coexistence"* option during onboarding if it's offered for your number. A dedicated new SIM is simplest.
   - Copy the **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`.
4. **Permanent token:** Business Settings → *Users → System users* → Add (Admin) → *Add assets* → your app (full control) and WhatsApp account → **Generate token** with `whatsapp_business_messaging` and `whatsapp_business_management` → `WHATSAPP_ACCESS_TOKEN`.
5. **App settings → Basic → App secret** → `WHATSAPP_APP_SECRET`.
6. Add a payment method in WhatsApp Manager. Replies to customers within 24 hours of their message ("service conversations") are free. Meta charges only for template messages.
7. Set the display name and profile photo (the Sundarlysh logo), and submit for **business verification** to get higher message limits.

### 2. Deploy the server
Any host that runs Node 22 or Docker with **HTTPS** and a **persistent disk** (for the SQLite file):

- **Railway / Render / Fly.io:** deploy this folder (Dockerfile included), attach a volume at `/data`, and set the environment variables from `.env.example`.
- **Any VPS:** `cp .env.example .env`, fill it in, `npm start` (behind Nginx/Caddy for HTTPS), or
  `docker build -t sundarlysh-bot . && docker run -d -p 3000:3000 -v sundarlysh-data:/data --env-file .env sundarlysh-bot`

Check that `https://<your-server>/health` returns `ok`.

### 3. Connect the webhook
WhatsApp → **Configuration** → Webhook → *Edit*:
- Callback URL: `https://<your-server>/webhook`
- Verify token: the same value as `WHATSAPP_VERIFY_TOKEN`
- Then **Subscribe** to the `messages` field.

Send "hi" to the business number from your phone. The bot should reply. 🎉

### 4. Team alerts outside the 24-hour window (recommended)
WhatsApp only allows free-form messages to someone who messaged the number in the last 24 hours. To make sure alerts always arrive, create two **Utility** templates in WhatsApp Manager → *Message templates*, then set their names in `.env`:

| Variable | Suggested name | Body |
|---|---|---|
| `ADMIN_ALERT_TEMPLATE` | `new_booking_alert` | `New Sundarlysh booking request {{1}}: {{2}}. Open WhatsApp to confirm or decline.` |
| `CUSTOMER_UPDATE_TEMPLATE` | `booking_update` | `Hi {{1}}, your Sundarlysh Events booking {{2}} is {{3}}. Reply here if you have any questions.` |

The bot always tries a normal message first and only uses the template if WhatsApp refuses it.
The admin reply after `confirm`/`decline` tells you whether the customer was reached.

## Customising

Everything business-specific lives in **`src/config.js`**: services (name, description, category), cities, time slots, guest ranges, response-time wording, and timeouts.
- A WhatsApp list holds at most **10 rows**. If you add more services, split them into two categories shown in separate steps, or swap one out.
- Row titles: max 24 characters. Descriptions: max 72. Button titles: max 20. `npm test` fails if any message breaks a WhatsApp limit.

## Files

| File | Purpose |
|---|---|
| `src/config.js` | services, cities, wording, settings |
| `src/flow.js` | the conversation (booking steps, menus, handoff, admin commands) |
| `src/whatsapp.js` | Cloud API payloads, sending, webhook parsing, signature check |
| `src/store.js` | SQLite: sessions, bookings, duplicate-message guard |
| `src/server.js` | webhook endpoint, dashboard, CSV export |
| `simulate.js` | terminal chat simulator |
| `test/bot.test.js` | automated tests |

## Security notes
- Every webhook POST is verified against `X-Hub-Signature-256` using the app secret. Unsigned requests are rejected.
- Duplicate webhook deliveries are ignored (Meta can deliver a message more than once).
- Keep `.env` private. The dashboard requires `ADMIN_DASHBOARD_TOKEN`, so use a long random value.
- The database stores customers' names, numbers and event details. Back up `/data/bookings.db` and keep access to the team.
