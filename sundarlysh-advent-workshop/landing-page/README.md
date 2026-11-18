# Advent Calendar Workshop – registration & payment page

`index.html` is a single, mobile-first page for the 29 Nov workshop. It has a hero section, how it works, why you'll love it, the event details, a registration form, an FAQ and a sticky "Book now" bar. It is a static page, so it can be hosted free on Netlify, GitHub Pages, Vercel or any host. **Not live yet.** The client asked to wait for approval.

## Settings (top of `index.html`)
| Setting | What to put |
|---|---|
| `PAYMENT_URL` | The **Razorpay Payment Page** link (Razorpay Dashboard → Payment Pages → Create → "Event tickets", ₹1,400). While it's empty, the button says "Register interest" or "DM us to book", so nobody can pay early. |
| `SHEET_ENDPOINT` | A Google Apps Script web-app URL that saves every registration into a Google Sheet (steps below). Optional. |
| `PRICE` / `PRICE_NOTE` | Shown on the details card. Set `PRICE: ""` to hide the price (it was removed from the reel). |
| `WHATSAPP` | `https://wa.me/91XXXXXXXXXX?text=...` using the new business number. Used when payments are off. |

Flow: the visitor fills in name, WhatsApp number, email, seats and kids. The details are saved to the Sheet, then the visitor is sent to the Razorpay page with name, email and phone prefilled.

## Google Sheet for registrations (5 minutes)
1. Create a Google Sheet with the headers `ts, name, phone, email, seats, kids, event`.
2. Extensions → Apps Script → paste:
```js
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
    .appendRow([d.ts, d.name, d.phone, d.email, d.seats, d.kids, d.event]);
  return ContentService.createTextOutput("ok");
}
```
3. Deploy → New deployment → Web app → Execute as: **Me**, Who has access: **Anyone**. Copy the URL into `SHEET_ENDPOINT`.

## Before going live
- Confirm the venue spelling (**Van Lavino Café & Patisserie**), the price and the early-bird wording with the client.
- Images are AI-generated illustrations. Swap in real photos after the first workshop (`img/`).
- Payments, refunds and GST are handled by Razorpay. Add a short cancellation policy line in the FAQ once it's decided.
