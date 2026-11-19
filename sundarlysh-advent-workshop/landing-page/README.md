# Advent Calendar Workshop – registration & payment page

`index.html` is a single, mobile-first page for the 29 Nov workshop. It has a hero section, how it works, why you'll love it, the event details, a registration form, an FAQ and a sticky "Book now" bar. It is a static page, so it can be hosted free on Netlify, GitHub Pages, Vercel or any host. **Not live yet.** The client asked to wait for approval.

## Settings (top of `index.html`)
| Setting | What to put |
|---|---|
| `PAYMENT_URL` | The **Razorpay Payment Page** link (Razorpay Dashboard → Payment Pages → Create → "Event tickets", ₹1,399). While it's empty, the button says "Register interest" or "DM us to book", so nobody can pay early. |
| `SHEET_ENDPOINT` | A Google Apps Script web-app URL that saves every registration into a Google Sheet (steps below). Optional. |
| `PRICE` / `PRICE_NOTE` | Shown on the details card. Set `PRICE: ""` to hide the price (it was removed from the reel). |
| `WHATSAPP_NUMBER` | The business WhatsApp number with country code, digits only (e.g. `919876543210`). It powers every "Book on WhatsApp" and "Gift a seat" button with a prefilled message. While it's empty, those buttons open an Instagram DM. |
| `TOTAL_SEATS` / `SEATS_BOOKED` | They show "6 booked · only 14 seats left" with a progress bar. **Real numbers only.** Update `SEATS_BOOKED` every evening, or leave it empty to hide the bar. |
| `FRIEND_OFFER` | The bring-a-friend offer text once the client approves it, e.g. `2 seats for ₹2,599`. |
| `START` | Workshop start time for the countdown strip. |

Flow: the visitor fills in name, WhatsApp number, email, seats and kids. The details are saved to the Sheet, then the visitor is sent to the Razorpay page with name, email and phone prefilled.

## Google Sheet for registrations (5 minutes)
1. Create a Google Sheet with the headers `ts, name, phone, email, seats, kids, source, event`.
2. Extensions → Apps Script → paste:
```js
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
    .appendRow([d.ts, d.name, d.phone, d.email, d.seats, d.kids, d.source, d.event]);
  return ContentService.createTextOutput("ok");
}
```
3. Deploy → New deployment → Web app → Execute as: **Me**, Who has access: **Anyone**. Copy the URL into `SHEET_ENDPOINT`.

## Tracking which channel brings bookings
Add `?src=` to every link you share, and each registration is saved with its source:
`?src=ig-bio`, `?src=ig-story`, `?src=wa-status`, `?src=wa-group`, `?src=flyer` (put this one in the QR), `?src=ad`, `?src=influencer-<name>`.
After 2–3 days, put more effort into the channel that brings the most bookings.

## Before going live
- Confirm the venue spelling (**Van Lavino Café & Patisserie**), the price and the early-bird wording with the client.
- Images are AI-generated illustrations. Swap in real photos after the first workshop (`img/`).
- Payments, refunds and GST are handled by Razorpay. Add a short cancellation policy line in the FAQ once it's decided.
