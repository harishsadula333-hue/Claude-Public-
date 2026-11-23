# Advent Calendar Workshop – booking page with a Razorpay Payment Page + e-tickets

**Event:** Christmas Advent Calendar Workshop · Sunday 29 Nov 2026 · 5–7 PM · **Stuff idly India, Kondapur, Hyderabad** · **₹999 per person** (includes ₹100 redeemable food & beverage).

## How booking works (no Razorpay API keys needed)
1. On this page the visitor enters name, email, WhatsApp number and seats, sees the total, and taps **Book your ticket**.
2. They're sent to **your Razorpay Payment Page** with **name, email and phone already filled in**. They choose the number of tickets there and pay.
3. Razorpay redirects them **back to this page**, which shows **"You're in!"** with their **ticket** (ticket number, name, date, time, venue, people, amount) and a **Download ticket (PDF)** button. Refreshing or reopening the ticket link shows the same ticket.
4. **Email:** Razorpay automatically emails every payer its official payment receipt. If you also set up the optional Google Apps Script backend (`backend/Code.gs`), the page emails the **ticket PDF** from your Gmail, numbers tickets in order (SM-ADV-001, 002…) and saves every booking in a Google Sheet.

To preview the success screen, open the page with `?demo=1`.

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

### 3. Optional but recommended: ticket emails + Google Sheet (free, about 10 minutes)
1. Create a Google Sheet with the business Gmail → **Extensions → Apps Script** → paste all of `backend/Code.gs` → Save.
2. Run `testSetup` once → allow the permissions. It creates the **Bookings** tab and emails you a sample ticket.
3. **Deploy → New deployment → Web app**: Execute as **Me**, Who has access **Anyone** → copy the URL into `TICKET_API_URL` in `index.html`.
4. Optional: **Project Settings → Script properties** → `PAGE_URL` = your booking page link (adds a "View your ticket online" button to emails).

### 4. Put it online
Drag the `landing-page` folder onto **app.netlify.com/drop**, then use that link in step 1's redirect URL.

### 5. Test
Book 1 seat and pay (you can refund yourself from the Razorpay dashboard). Check that the details were pre-filled, you came back to the ticket, the PDF downloads, the emails arrived, and the row appears in the sheet.

## Important: checking payments
A Payment Page doesn't send a payment proof back to your website, so the ticket is issued when the customer returns from Razorpay. Someone could open the success link without paying, so before the event (and at the door), match each ticket with Razorpay:
**Dashboard → Payment Pages → your page → Payments** (names, phones, emails, amounts). Tick the **verified** checkbox in the Bookings sheet as you go. A guest can also show Razorpay's receipt email.

## Notes
- If someone pays on a different phone or browser from the one they booked on, the page asks them to re-enter their details to get the ticket.
- Gmail sends about 100 emails a day from a free account, which is plenty for this event.
- Price changes: update the Payment Page, plus `PRICE_PER_SEAT`, `PRICE` and `PRICE_NOTE` in `index.html` and `CFG.PRICE` in `Code.gs`.
