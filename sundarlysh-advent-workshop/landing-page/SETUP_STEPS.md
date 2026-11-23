# Make tickets work automatically – step by step (about 15 minutes)

Customers pay on your Razorpay Payment Page. Within about 5 minutes the ticket is **emailed to them automatically**. It works even if Razorpay doesn't send them back to the website. On the website, "Get your e-ticket" finds their real payment by email or phone, so nobody can get a ticket without paying.

---

## Step 1 – Razorpay: turn on payment emails (2 min)
1. Razorpay Dashboard → **Account & Settings** → **Email** (under *Notification settings*).
2. Make sure **standoutstylishsos@gmail.com** is listed under **Email Notifications** for **payments received**. Save.

## Step 2 – Google: create the Sheet + script (5 min)
Do this **logged in as standoutstylishsos@gmail.com**, the same Gmail that receives Razorpay's emails.
1. Go to **sheets.google.com** → **Blank spreadsheet** → name it **Sundarlysh Bookings**.
2. **Extensions → Apps Script** → delete everything → paste all of **`Google_Apps_Script_CODE_copy_paste.txt`** → **Save (💾)**.

## Step 3 – Test what the script can see (2 min)
1. In the dropdown next to **▶ Run**, choose **`testSetup`** → **Run** → **Review permissions** → choose the account → **Advanced** → **Go to … (unsafe)** → **Allow**. This screen is normal for your own scripts.
2. Open **View → Logs** (or *Execution log*). You should see your test payment(s), for example
   `{"id":"pay_…","amount":999,"email":"…","phone":"…","name":"…"}`
3. **If it says "payments found: 0"** → run **`showRazorpayEmails`** and send the log text to Claude. It shows what Razorpay's emails look like so the reader can be adjusted.

## Step 4 – Switch on automatic tickets (1 min)
Choose **`startAutoTickets`** → **Run**. Tickets are issued and emailed for payments already received, and from now on the script checks every 5 minutes on its own. Every ticket appears in the **Bookings** tab.

## Step 5 – Connect the website (3 min)
1. **Deploy → New deployment →** ⚙ **Web app** → Execute as **Me** → Who has access **Anyone** → **Deploy** → copy the **Web app URL**.
2. Send that URL to Claude (it gets added to the page as `TICKET_API_URL`), then upload the updated `landing-page` folder to Netlify (your site → **Deploys** → drag the folder in).
3. Optional: **Project Settings → Script properties → Add** `PAGE_URL` = `https://sundarlysh-advent-calender.netlify.app` (adds a "View your ticket online" button in the email).

## Step 6 – Razorpay page settings
- Keep **Redirect to your website** = `https://sundarlysh-advent-calender.netlify.app/?paid=1`. When it works, the customer sees their ticket on the website right away. When it doesn't, they still get it by email.
- Add this line to your Payment Page description:
  *After payment your e-ticket is emailed to you within 5 minutes. You can also get it at sundarlysh-advent-calender.netlify.app → "Already paid? Get your e-ticket".*

---

### Good to know
- The **number of people** on a ticket is the amount paid ÷ ₹999.
- Each Razorpay payment produces **one** ticket, never two.
- If a payment has no email (rare), the Bookings sheet shows "no email found – send manually".
- Gmail can send about 100 emails a day from a free account, which is plenty for this event.
- Later, if you create a Razorpay **API key**, add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Script properties. The script then reads payments directly from Razorpay instead of from emails. Nothing else changes.
