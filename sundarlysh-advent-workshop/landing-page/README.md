# Advent Calendar Workshop – booking page with a Razorpay Payment Page + e-tickets

**Event:** Christmas Advent Calendar Workshop · Sunday 29 Nov 2026 · 5–7 PM · **Stuff idly India, Kondapur, Hyderabad** · **₹999 per person** (includes ₹100 redeemable food & beverage).

## How booking works
1. Every **Book now** button on the page opens **your Razorpay Payment Page** (`pages.razorpay.com/pl_TrTGmhhveQIklu/view`). The customer fills in their details and pays there.
2. Razorpay sends them **back to this page** (`?paid=1`). The page shows **"Payment done!"** and asks for their **name** (plus optional phone and email) and the **number of tickets bought**.
3. It then shows their **e-ticket** with a **Download ticket (PDF)** button. Refreshing or reopening the ticket link shows the same ticket.
4. Razorpay emails every payer its official receipt. With the optional Google Apps Script backend, the ticket PDF is also emailed and every booking is saved in a Google Sheet.

To preview the ticket screen, open the page with `?demo=1`.

## Setup

### 1. Razorpay Payment Page settings (Dashboard → Payment Pages → your page → Edit)
- **Fields:** keep the input fields labelled exactly **Full name**, **Email** and **Phone**, as *Single Line* (name) and the Email and Phone field types. The page fills them using `full_name`, `email` and `phone`.
  If you rename a field, update `PREFILL` in `index.html`: lowercase, spaces become underscores (e.g. "Your Name" → `your_name`).
- **Page Settings → Action after successful payment → Redirect to your website** → enter your booking page link followed by `?paid=1`, e.g.
  `https://your-site.netlify.app/?paid=1`
- **Payment Receipts → Send Automated Receipts** (on), so every payer gets Razorpay's receipt by email.
- **Ticket price:** keep it at ₹999 with quantity. Optional: to pre-fill the number of seats, mark the Ticket price field **Optional** and set `QTY_FIELD: "ticket_price"` in `index.html`.

### 2. Connect the page (`index.html`, settings block at the top)
- `PAYMENT_PAGE_URL:` your Payment Page's long link. Open your `rzp.io/...` short link and copy the `https://pages.razorpay.com/pl_.../view` address it opens.
- `WHATSAPP_NUMBER:` the business number, e.g. `919876543210`.

### 3. Payment check + ticket emails (Google Apps Script, free, about 15 minutes)
This step closes the "typed ?paid=1 by hand" gap: **no ticket is shown until Razorpay confirms a real payment.**
1. **Razorpay key (for checking only):** Dashboard → **Account & Settings → API Keys → Generate Key**. Copy the **Key ID** and **Key Secret**. Your Payment Page keeps working exactly as before; the key only lets the script *read* your payments.
2. Create a Google Sheet with the business Gmail → **Extensions → Apps Script** → paste all of `backend/Code.gs` (or the `.txt` copy) → **Save**.
3. **Project Settings (⚙️) → Script properties → Add:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and optionally `PAGE_URL` (your booking page link). Never put the secret in `index.html`.
4. Choose `testSetup` → **Run** → allow permissions. The log says "Razorpay keys OK", the **Bookings** tab appears, and you get a sample ticket email.
5. **Deploy → New deployment → Web app**: Execute as **Me**, Who has access **Anyone** → copy the URL into `TICKET_API_URL` in `index.html`.
6. **Triggers (⏰) → Add trigger** → function `reconcilePending`, Time-driven, **Every 10 minutes**. This emails tickets to people who paid but closed the page before it confirmed.

**How the check works:** when the customer returns from Razorpay, the page shows "Confirming your payment…" and the script looks in your Razorpay payments for a **successful** payment from the **same email or phone**, for a **multiple of ₹999**, made **recently**, and **not already used** for another ticket. Only then does it issue the ticket, with the real Razorpay Payment ID, and email it. The number of people on the ticket comes from the amount actually paid.

### 4. Put it online
Drag the `landing-page` folder onto **app.netlify.com/drop**, then use that link in step 1's redirect URL.

### 5. Test
Book 1 seat and pay (you can refund yourself from the Razorpay dashboard). Check that the details were pre-filled, you came back to the ticket, the PDF downloads, the emails arrived, and the row appears in the sheet.

## Fake success links are blocked
With step 3 set up, opening the success link without paying gets "We couldn't find your payment yet" and no ticket. Each Razorpay payment can produce only one ticket. (Without step 3 the page can't check with Razorpay, so it shows the ticket on return. Don't skip step 3.)

## Notes
- If someone pays on a different phone or browser from the one they booked on, the page asks them to re-enter their details to get the ticket.
- Gmail sends about 100 emails a day from a free account, which is plenty for this event.
- Price changes: update the Payment Page, plus `PRICE_PER_SEAT`, `PRICE` and `PRICE_NOTE` in `index.html` and `CFG.PRICE` in `Code.gs`.
