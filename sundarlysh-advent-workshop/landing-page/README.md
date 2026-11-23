# Advent Calendar Workshop – booking page with Razorpay + e-tickets

**Event:** Christmas Advent Calendar Workshop · Sunday 29 Nov 2026 · 5–7 PM · **Stuff idly India, Kondapur, Hyderabad** · **₹999 per person** (includes ₹100 redeemable food & beverage).

## How booking works
1. The visitor enters name, email, WhatsApp number and seats, sees the total, and taps **Book your ticket**.
2. The page asks the backend to create a Razorpay order. The backend decides the amount (₹999 × seats), so nobody can change the price in their browser.
3. **Razorpay's secure payment window** opens (UPI, cards, netbanking, wallets). It fills the whole screen on phones.
4. After payment, the backend **verifies Razorpay's signature** and double-checks the payment with Razorpay. Only then does it issue a ticket number (`SM-ADV-001`, `SM-ADV-002`…), save the booking in Google Sheets and **email the ticket as a PDF**.
5. The page shows **"You're in!"**, the ticket, and a **Download ticket (PDF)** button. The ticket link (`?ticket=…&key=…`) also works later, and the email has a "View your ticket online" button.
6. If someone pays and closes the page too early, the `reconcilePending` trigger issues and emails their ticket within 10 minutes.

To preview the success screen without paying, open the page with `?demo=1`.

## One-time setup (about 15 minutes)

### A. Razorpay API keys
Razorpay Dashboard → **Account & Settings → API Keys → Generate Key**. Copy the **Key ID** and the **Key Secret** (the secret is shown only once).
Start with **Test Mode** keys (`rzp_test_…`) to try it with Razorpay's test cards and UPI, then switch to **Live** keys.

### B. The backend (Google Apps Script, free)
1. Create a new **Google Sheet** (e.g. "Sundarlysh Bookings") using the business Gmail. Ticket emails are sent from this account.
2. In the sheet: **Extensions → Apps Script**. Delete the sample code and paste all of `backend/Code.gs`. Save.
3. **Project Settings (⚙️) → Script properties → Add**:
   | Property | Value |
   |---|---|
   | `RAZORPAY_KEY_ID` | your Key ID |
   | `RAZORPAY_KEY_SECRET` | your Key Secret |
   | `PAGE_URL` | the booking page's public link (add it after step D) |
   | `TOTAL_SEATS` | optional, e.g. `20`, stops sales when full |
4. In the editor, choose `testSetup` → **Run** → allow the permissions. The log should say "Razorpay keys OK", and a **Bookings** tab appears in the sheet.
5. **Deploy → New deployment → Web app**: Execute as **Me**, Who has access **Anyone** → Deploy. Copy the **Web app URL**.
6. **Triggers (⏰) → Add trigger**: function `reconcilePending`, Time-driven, **Every 10 minutes**.

> The Key Secret lives only in the Script properties. Never put it in `index.html`.

### C. Connect the page
In `index.html`, settings block near the top:
- `API_URL:` paste the Web app URL from step B5.
- `WHATSAPP_NUMBER:` the business number, e.g. `919876543210` (used by the WhatsApp buttons).

### D. Put it online
Drag the `landing-page` folder onto **app.netlify.com/drop**. You get a link immediately. Put that link in `PAGE_URL` (step B3).

### E. Test before sharing
With **Test Mode** keys: book 1 seat → pay with a Razorpay test card or `success@razorpay` UPI → check the ticket shows, the PDF downloads, the email arrives and a PAID row appears in the sheet. Then swap in the **Live** keys (Script properties only) and do one real ₹999 booking, which you can refund from Razorpay.

## At the event
The **Bookings** sheet lists every PAID ticket number, name, seats and phone. Check names off at the door. There's no QR, so match the ticket number.

## Notes
- Gmail sends up to ~100 emails a day from a free account, which is plenty for this event.
- To change the price, change it in both `Code.gs` (`CFG.PRICE`) and `index.html` (`PRICE_PER_SEAT`, `PRICE`, `PRICE_NOTE`). The backend's number is what gets charged.
- If you redeploy the Apps Script after editing it: **Deploy → Manage deployments → Edit → New version**, so the URL stays the same.
