/**
 * Sundarlysh Memories – ticket backend for a Razorpay PAYMENT PAGE
 * WITHOUT Razorpay API keys: issues the ticket when the customer returns from the Payment Page, emails it and saves it.
 * WITH keys (optional, add later): also VERIFIES the payment with Razorpay before issuing.
 * ---- details below describe the verified mode ----
 * -------------------------------------------------------------------------
 * Customers still pay on your Razorpay Payment Page. When they come back to the website, this script
 * ASKS RAZORPAY whether a real, successful payment exists for them before issuing a ticket.
 * Typing "?paid=1" by hand gets no ticket, and each payment can only produce one ticket.
 *
 *  - pending          : logs the booking just before the visitor goes to the Payment Page
 *  - issue            : checks Razorpay for a matching successful payment (same email or phone, a multiple of the
 *                       ticket price, recent, not already used). Found → ticket number + email. Not found → "waiting".
 *  - lookup           : re-shows an issued ticket (link in the email)
 *  - reconcilePending : time trigger every 10 min – emails tickets to people who paid but closed the page early
 *
 * Script properties (Project Settings → Script properties):
 *   RAZORPAY_KEY_ID      rzp_live_...   (Razorpay Dashboard → Account & Settings → API Keys → Generate Key)
 *   RAZORPAY_KEY_SECRET  the matching secret  — keep it ONLY here, never in the website
 *   PAGE_URL             (optional) public link of the booking page, for the "View your ticket online" button
 */

var CFG = {
  EVENT: "Christmas Advent Calendar Workshop",
  DATE: "Sunday, 29 November 2026",
  TIME: "5:00 PM – 7:00 PM",
  VENUE: "Stuff idly India",
  AREA: "Kondapur, Hyderabad",
  PRICE: 999,                 // rupees per ticket – must match the Payment Page
  MAX_SEATS: 10,
  PREFIX: "SM-ADV-",
  FROM_NAME: "Sundarlysh Memories",
  REPLY_TO: "",               // optional business email for replies
  LOOKBACK_MIN: 120,          // how far back to look for the payment after a booking attempt
  SHEET: "Bookings"
};
// columns: 1 created_at | 2 status | 3 ticket_no | 4 ref | 5 name | 6 email | 7 phone | 8 seats | 9 kids | 10 amount
//          11 payment_id | 12 source | 13 issued_at | 14 email_sent
var HEAD = ["created_at", "status", "ticket_no", "ref", "name", "email", "phone", "seats", "kids", "amount", "payment_id", "source", "issued_at", "email_sent"];

function doGet() { return out({ ok: true, service: "Sundarlysh tickets" }); }

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents || "{}");
    if (d.action === "pending") return out(pending(d));
    if (d.action === "issue") return out(issue(d));
    if (d.action === "lookup") return out(lookup(d));
    return out({ ok: false, error: "Unknown action" });
  } catch (err) {
    return out({ ok: false, error: String(err && err.message || err) });
  }
}

/* ---------------- actions ---------------- */

function pending(d) {
  var b = clean(d), sh = sheet();
  if (findRow(sh, b.ref) < 0) sh.appendRow([new Date(), "PENDING", "", b.ref, b.name, b.email, "'" + b.phone, b.seats, b.kids, b.seats * CFG.PRICE, "", b.source, "", ""]);
  return { ok: true };
}

function issue(d) {
  var b = clean(d);
  var lock = LockService.getScriptLock(); lock.waitLock(25000);
  try {
    var sh = sheet(), r = findRow(sh, b.ref);
    if (r < 0) {   // e.g. paid on another device: create the booking now
      sh.appendRow([new Date(), "PENDING", "", b.ref, b.name, b.email, "'" + b.phone, b.seats, b.kids, b.seats * CFG.PRICE, "", b.source, "", ""]);
      r = sh.getLastRow();
    }
    var row = sh.getRange(r, 1, 1, HEAD.length).getValues()[0];
    if (row[1] === "TICKET ISSUED") return { ok: true, ticket: ticketOf(row) };
    if (!hasKeys()) {   // no API keys: issue on return from the Payment Page (unverified)
      return { ok: true, ticket: markIssued(sh, r, { id: "", amount: Number(row[7]) * CFG.PRICE * 100 }) };
    }
    var since = new Date(row[0]).getTime() - 15 * 60 * 1000;
    if (d.claim) since = Date.now() - 3 * 24 * 3600 * 1000;      // "paid on another device": look back 3 days
    var pay = findPayment(row[5], String(row[6]).replace("'", ""), since);
    if (!pay) return { ok: true, waiting: true };
    return { ok: true, ticket: markIssued(sh, r, pay) };
  } finally { lock.releaseLock(); }
}

function lookup(d) {
  var v = sheet().getDataRange().getValues();
  for (var i = 1; i < v.length; i++)
    if (v[i][2] === d.ticket_no && (v[i][3] === d.key || v[i][10] === d.key) && v[i][1] === "TICKET ISSUED") return { ok: true, ticket: ticketOf(v[i]) };
  throw new Error("Ticket not found");
}

/** Time-driven trigger, every 10 minutes: finds payments for bookings whose owners closed the page too early. */
function reconcilePending() {
  if (!hasKeys()) return;
  var lock = LockService.getScriptLock(); lock.waitLock(25000);
  try {
    var sh = sheet(), v = sh.getDataRange().getValues(), now = Date.now();
    for (var i = 1; i < v.length; i++) {
      if (v[i][1] !== "PENDING") continue;
      var t0 = new Date(v[i][0]).getTime();
      if (now - t0 < 60 * 1000 || now - t0 > 3 * 24 * 3600 * 1000) continue;
      try {
        var pay = findPayment(v[i][5], String(v[i][6]).replace("'", ""), t0 - 15 * 60 * 1000);
        if (pay) markIssued(sh, i + 1, pay);
      } catch (e) { Logger.log("reconcile row " + (i + 1) + ": " + e); }
    }
  } finally { lock.releaseLock(); }
}

/* ---------------- payment check (asks Razorpay) ---------------- */

function findPayment(email, phone, sinceMs) {
  email = String(email || "").toLowerCase().trim(); phone = String(phone || "").replace(/\D/g, "").slice(-10);
  var used = usedPaymentIds(), from = Math.floor(Math.max(sinceMs, Date.now() - 3 * 24 * 3600 * 1000) / 1000);
  for (var skip = 0; skip < 500; skip += 100) {
    var res = rzp("get", "/payments?count=100&skip=" + skip + "&from=" + from), items = res.items || [];
    for (var k = 0; k < items.length; k++) {
      var p = items[k];
      if (p.status !== "captured" && p.status !== "authorized") continue;
      if (p.currency !== "INR" || p.amount % (CFG.PRICE * 100) !== 0) continue;
      if (used[p.id]) continue;
      var pe = String(p.email || "").toLowerCase().trim(), pc = String(p.contact || "").replace(/\D/g, "").slice(-10);
      if ((email && pe === email) || (phone && pc === phone)) return p;
    }
    if (items.length < 100) break;
  }
  return null;
}

function markIssued(sh, r, pay) {
  var v = sh.getDataRange().getValues(), n = 0;
  for (var j = 1; j < v.length; j++) if (v[j][1] === "TICKET ISSUED") n++;
  var seats = Math.round(pay.amount / (CFG.PRICE * 100));     // what they actually paid for on the Payment Page
  var ticketNo = CFG.PREFIX + ("00" + (n + 1)).slice(-3);
  sh.getRange(r, 2).setValue("TICKET ISSUED"); sh.getRange(r, 3).setValue(ticketNo);
  sh.getRange(r, 8).setValue(seats); sh.getRange(r, 10).setValue(pay.amount / 100);
  if (pay.id) sh.getRange(r, 11).setValue(pay.id);
  sh.getRange(r, 13).setValue(new Date());
  SpreadsheetApp.flush();
  var t = ticketOf(sh.getRange(r, 1, 1, HEAD.length).getValues()[0]);
  try { sendTicket(t); sh.getRange(r, 14).setValue("yes"); t.email_sent = true; }
  catch (e) { sh.getRange(r, 14).setValue("FAILED: " + e); t.email_sent = false; }
  return t;
}

function hasKeys() { return !!(prop("RAZORPAY_KEY_ID") && prop("RAZORPAY_KEY_SECRET")); }
function usedPaymentIds() {
  var v = sheet().getDataRange().getValues(), u = {};
  for (var i = 1; i < v.length; i++) if (v[i][10]) u[v[i][10]] = true;
  return u;
}

/* ---------------- ticket + email ---------------- */

function ticketOf(r) {
  return { ticket_no: r[2], ref: r[3], name: r[4], email: r[5], phone: String(r[6]).replace("'", ""), seats: Number(r[7]), amount: Number(r[9]),
           payment_id: r[10] || "", event: CFG.EVENT, date: CFG.DATE, time: CFG.TIME, venue: CFG.VENUE, area: CFG.AREA, email_sent: String(r[13]) === "yes" };
}

function sendTicket(t) {
  var html = ticketHtml(t);
  var pdf = Utilities.newBlob(html, MimeType.HTML, "ticket.html").getAs(MimeType.PDF).setName(t.ticket_no + "_Sundarlysh_Advent_Workshop.pdf");
  var pu = prop("PAGE_URL");
  var link = pu ? pu + (pu.indexOf("?") < 0 ? "?" : "&") + "ticket=" + encodeURIComponent(t.ticket_no) + "&key=" + encodeURIComponent(t.ref) : "";
  var body = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2E1A22">' +
    '<p>Hi ' + esc(t.name) + ',</p><p>Thank you for booking! 🎄 Your seat for the <b>' + esc(t.event) + '</b> is booked. Your ticket is below and attached as a PDF.</p>' +
    html.replace(/^[\s\S]*<body>|<\/body>[\s\S]*$/g, "") +
    (link ? '<p style="text-align:center"><a href="' + link + '" style="background:#45012A;color:#F0D8A0;padding:12px 22px;border-radius:30px;text-decoration:none;font-weight:bold">View your ticket online</a></p>' : "") +
    '<p>Please show this ticket at entry, on your phone or printed. Doors open 4:45 PM.</p><p>See you soon!<br><b>Team Sundarlysh Memories</b><br>Instagram: @sundarlyshmemories</p></div>';
  var opt = { htmlBody: body, name: CFG.FROM_NAME, attachments: [pdf] };
  if (CFG.REPLY_TO) opt.replyTo = CFG.REPLY_TO;
  MailApp.sendEmail(t.email, "Your ticket " + t.ticket_no + " · " + t.event + " · 29 Nov", "Your ticket " + t.ticket_no + " is attached.", opt);
}

function ticketHtml(t) {
  var cell = function (k, v) { return '<td style="padding:8px 12px;vertical-align:top"><div style="font-size:10px;font-weight:bold;letter-spacing:1.5px;color:#8a6f7a">' + k + '</div><div style="font-size:16px;color:#2E1A22;margin-top:2px">' + esc(v) + '</div></td>'; };
  return '<html><body><div style="border:2px solid #C9A55E;border-radius:14px;overflow:hidden;font-family:Arial,sans-serif;background:#FBF6F1">' +
    '<div style="background:#45012A;color:#F0D8A0;padding:14px 18px"><table width="100%"><tr><td><div style="font-size:16px;font-weight:bold;letter-spacing:3px">SUNDARLYSH MEMORIES</div><div style="font-size:11px;letter-spacing:2px">E-TICKET</div></td>' +
    '<td style="text-align:right"><div style="font-size:11px">Ticket no.</div><div style="font-size:20px;font-weight:bold">' + esc(t.ticket_no) + '</div></td></tr></table></div>' +
    '<div style="padding:16px 18px 4px;font-family:Georgia,serif;font-style:italic;font-size:24px;color:#45012A">' + esc(t.event) + '</div>' +
    '<table width="100%" style="border-collapse:collapse;margin:4px 6px">' +
    '<tr>' + cell("NAME", t.name) + cell("ADMITS", t.seats + (t.seats == 1 ? " person" : " people")) + '</tr>' +
    '<tr>' + cell("DATE", t.date) + cell("TIME", t.time) + '</tr>' +
    '<tr>' + cell("VENUE", t.venue + ", " + t.area) + cell("AMOUNT PAID", "₹" + Number(t.amount).toLocaleString("en-IN")) + '</tr>' +
    '<tr>' + cell(t.payment_id ? "PAYMENT ID" : "BOOKING REF", t.payment_id || t.ref) + '<td></td></tr></table>' +
    '<div style="border-top:2px dashed #d9c6cc;padding:12px 18px;font-size:12px;color:#6c5560">Please show this ticket at entry (on your phone or printed). Includes ₹100 redeemable food &amp; beverage per person at ' + esc(t.venue) + '.</div>' +
    '</div></body></html>';
}

/* ---------------- helpers ---------------- */

function rzp(method, path, payload) {
  var id = prop("RAZORPAY_KEY_ID"), secret = prop("RAZORPAY_KEY_SECRET");
  if (!id || !secret) throw new Error("Payment check is not set up yet");
  var opt = { method: method, muteHttpExceptions: true, contentType: "application/json",
              headers: { Authorization: "Basic " + Utilities.base64Encode(id + ":" + secret) } };
  if (payload) opt.payload = JSON.stringify(payload);
  var res = UrlFetchApp.fetch("https://api.razorpay.com/v1" + path, opt), body = JSON.parse(res.getContentText() || "{}");
  if (res.getResponseCode() >= 300) throw new Error((body.error && body.error.description) || "Payment service error");
  return body;
}
function clean(d) {
  var c = function (s, n) { return String(s == null ? "" : s).replace(/[<>]/g, "").trim().slice(0, n); };
  var seats = parseInt(d.seats, 10);
  var b = { ref: c(d.ref, 40), name: c(d.name, 80), email: c(d.email, 120).toLowerCase(), phone: String(d.phone || "").replace(/\D/g, "").slice(-10),
            seats: seats, kids: c(d.kids, 5), source: c(d.source, 60) };
  if (!b.ref) throw new Error("Missing booking reference");
  if (b.name.length < 2) throw new Error("Please enter your name.");
  if (!/^\S+@\S+\.\S+$/.test(b.email)) throw new Error("Please enter a valid email.");
  if (b.phone.length !== 10) throw new Error("Please enter a valid 10-digit phone number.");
  if (!(seats >= 1 && seats <= CFG.MAX_SEATS)) throw new Error("Please choose 1–" + CFG.MAX_SEATS + " seats.");
  return b;
}
function findRow(sh, ref) {
  var v = sh.getDataRange().getValues();
  for (var i = v.length - 1; i >= 1; i--) if (v[i][3] === ref) return i + 1;
  return -1;
}
function sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(CFG.SHEET);
  if (!sh) { sh = ss.insertSheet(CFG.SHEET); sh.appendRow(HEAD); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD.length).setFontWeight("bold"); }
  return sh;
}
function prop(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** Run once from the editor: checks the Razorpay keys, creates the sheet, and emails YOU a sample ticket. */
function testSetup() {
  sheet();
  if (hasKeys()) { var res = rzp("get", "/payments?count=5"); Logger.log("Razorpay keys OK – payments will be verified."); }
  else Logger.log("No Razorpay keys – tickets are issued when customers return from the Payment Page (not verified).");
  var me = Session.getActiveUser().getEmail();
  sendTicket({ ticket_no: "SM-ADV-000", ref: "SMTEST", name: "Test Guest", email: me, seats: 1, amount: CFG.PRICE, payment_id: "pay_TEST",
               event: CFG.EVENT, date: CFG.DATE, time: CFG.TIME, venue: CFG.VENUE, area: CFG.AREA });
  Logger.log("Sample ticket emailed to " + me);
}
