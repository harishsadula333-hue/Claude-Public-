/**
 * Sundarlysh Memories – AUTOMATIC e-tickets for a Razorpay PAYMENT PAGE (works even if Razorpay doesn't redirect)
 * ------------------------------------------------------------------------------------------------------------
 * Paste this into Extensions → Apps Script of a Google Sheet that belongs to the SAME Gmail that receives
 * Razorpay's payment emails (the Razorpay account email, e.g. standoutstylishsos@gmail.com).
 *
 * How it works
 *  1. Every 5 minutes (trigger on `autoTickets`) the script collects new successful payments:
 *       - from Razorpay's API if RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are set (most reliable), otherwise
 *       - from Razorpay's "payment received" emails in this Gmail (no API key needed).
 *  2. Each new payment gets a ticket number (SM-ADV-001, 002…), is saved in the "Bookings" sheet, and the
 *     e-ticket PDF is emailed to the customer. Seats = amount paid / ticket price.
 *  3. The website's "Get your e-ticket" asks for the email/phone used to pay and shows the ticket ONLY if
 *     that payment exists here (it also runs a fresh check first). Fake "?paid=1" visits get no ticket.
 *
 * Script properties (Project Settings → Script properties) – all optional:
 *   PAGE_URL             public booking page link (adds a "View your ticket online" button to the email)
 *   RAZORPAY_KEY_ID      only if you later create an API key (then Gmail reading isn't needed)
 *   RAZORPAY_KEY_SECRET  "
 */

var CFG = {
  EVENT: "Christmas Advent Calendar Workshop",
  DATE: "Sunday, 29 November 2026",
  TIME: "5:00 PM – 7:00 PM",
  VENUE: "Stuff idly India",
  AREA: "Kondapur, Hyderabad",
  PRICE: 999,                       // ₹ per ticket – must match the Payment Page
  PREFIX: "SM-ADV-",
  FROM_NAME: "Sundarlysh Memories",
  REPLY_TO: "",                     // optional business email for replies
  SINCE: "2026/11/20",              // ignore payments/emails before this date (yyyy/mm/dd)
  GMAIL_QUERY: 'from:razorpay newer_than:10d',
  OWN_EMAILS: ["standoutstylishsos@gmail.com"],   // never treat these as the customer's email
  SHEET: "Bookings"
};
// columns: 1 created_at | 2 status | 3 ticket_no | 4 payment_id | 5 name | 6 email | 7 phone | 8 seats | 9 amount
//          10 source | 11 email_sent | 12 notes
var HEAD = ["created_at", "status", "ticket_no", "payment_id", "name", "email", "phone", "seats", "amount", "source", "email_sent", "notes"];

/* =============================== web app (called by the booking page) =============================== */

function doGet() { return out({ ok: true, service: "Sundarlysh tickets" }); }

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents || "{}");
    if (d.action === "find") return out(find(d));
    if (d.action === "lookup") return out(lookup(d));
    return out({ ok: false, error: "Unknown action" });
  } catch (err) {
    return out({ ok: false, error: String(err && err.message || err) });
  }
}

/** Customer says "I paid": look for their ticket by email or phone (after a fresh scan). */
function find(d) {
  var email = String(d.email || "").toLowerCase().trim(), phone = digits(d.phone);
  if (!email && phone.length !== 10) throw new Error("Please enter the email or phone number you paid with.");
  var t = matchTicket(email, phone);
  if (!t) { try { autoTickets(); } catch (e) { Logger.log("scan: " + e); } t = matchTicket(email, phone); }
  if (!t) return { ok: true, waiting: true };
  if (d.name && (!t.name || t.name === "Guest")) {          // fill in the name if Razorpay didn't give one
    var sh = sheet(), r = rowOfPayment(sh, t.payment_id);
    if (r > 0) { sh.getRange(r, 5).setValue(String(d.name).slice(0, 80)); t.name = String(d.name).slice(0, 80); }
  }
  return { ok: true, ticket: t };
}

function lookup(d) {
  var v = sheet().getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (v[i][2] === d.ticket_no && v[i][3] === d.key) return { ok: true, ticket: ticketOf(v[i]) };
  throw new Error("Ticket not found");
}

function matchTicket(email, phone) {
  var v = sheet().getDataRange().getValues();
  for (var i = v.length - 1; i >= 1; i--) {
    if (v[i][1] !== "TICKET ISSUED") continue;
    var ve = String(v[i][5]).toLowerCase(), vp = digits(v[i][6]);
    if ((email && ve === email) || (phone && vp === phone)) return ticketOf(v[i]);
  }
  return null;
}

/* =============================== the 5-minute job =============================== */

/** Trigger: Time-driven, every 5 minutes. Finds new payments and emails their tickets. */
function autoTickets() {
  var lock = LockService.getScriptLock(); if (!lock.tryLock(20000)) return;
  try {
    var pays = hasKeys() ? paymentsFromApi() : paymentsFromGmail();
    var sh = sheet(), known = {}, v = sh.getDataRange().getValues();
    for (var i = 1; i < v.length; i++) if (v[i][3]) known[v[i][3]] = true;
    pays.forEach(function (p) {
      if (known[p.id] || !(p.amount > 0) || p.amount % CFG.PRICE !== 0) return;
      issueTicket(sh, p); known[p.id] = true;
    });
  } finally { lock.releaseLock(); }
}

function issueTicket(sh, p) {
  var v = sh.getDataRange().getValues(), n = 0;
  for (var j = 1; j < v.length; j++) if (v[j][1] === "TICKET ISSUED") n++;
  var ticketNo = CFG.PREFIX + ("00" + (n + 1)).slice(-3), seats = Math.round(p.amount / CFG.PRICE);
  sh.appendRow([new Date(), "TICKET ISSUED", ticketNo, p.id, p.name || "Guest", p.email || "", p.phone ? "'" + p.phone : "", seats, p.amount, p.source, "", ""]);
  var r = sh.getLastRow(), t = ticketOf(sh.getRange(r, 1, 1, HEAD.length).getValues()[0]);
  if (t.email) {
    try { sendTicket(t); sh.getRange(r, 11).setValue("yes"); } catch (e) { sh.getRange(r, 11).setValue("FAILED: " + e); }
  } else sh.getRange(r, 11).setValue("no email found – send manually");
}

/* ---------- source 1: Razorpay API (only if keys are set) ---------- */
function paymentsFromApi() {
  var since = Math.floor(new Date(CFG.SINCE.replace(/\//g, "-") + "T00:00:00+05:30").getTime() / 1000), out_ = [];
  for (var skip = 0; skip < 1000; skip += 100) {
    var items = (rzp("/payments?count=100&skip=" + skip + "&from=" + since).items || []);
    items.forEach(function (p) {
      if ((p.status === "captured" || p.status === "authorized") && p.currency === "INR") {
        var nm = p.notes && (p.notes.full_name || p.notes.name || p.notes["Full name"]) || "";
        out_.push({ id: p.id, amount: p.amount / 100, email: String(p.email || "").toLowerCase(), phone: digits(p.contact), name: nm, source: "api" });
      }
    });
    if (items.length < 100) break;
  }
  return out_;
}

/* ---------- source 2: Razorpay emails in this Gmail (no API key) ---------- */
function paymentsFromGmail() {
  var since = new Date(CFG.SINCE.replace(/\//g, "-") + "T00:00:00+05:30"), out_ = [], seen = {};
  var threads = GmailApp.search(CFG.GMAIL_QUERY + " after:" + CFG.SINCE, 0, 100);
  threads.forEach(function (th) {
    th.getMessages().forEach(function (m) {
      if (m.getDate() < since) return;
      var p = parseRazorpayEmail(m.getSubject(), m.getPlainBody() || stripHtml(m.getBody()));
      if (p && !seen[p.id]) { seen[p.id] = true; p.source = "gmail"; out_.push(p); }
    });
  });
  return out_;
}

/** Pulls payment id, amount, customer email/phone/name out of a Razorpay payment email. */
function parseRazorpayEmail(subject, body) {
  var text = (subject + "\n" + body).replace(/ /g, " ");
  if (/refund|failed|settlement|payout|report|invoice due|kyc/i.test(subject)) return null;
  var id = (text.match(/\bpay_[A-Za-z0-9]{14}\b/) || [])[0];
  if (!id) return null;
  var amt = 0, m;
  var amtRe = /(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/gi;
  while ((m = amtRe.exec(text))) { var a = Number(m[1].replace(/,/g, "")); if (a >= CFG.PRICE && a % CFG.PRICE === 0) { amt = a; break; } if (!amt) amt = a; }
  var emails = (text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []).map(function (x) { return x.toLowerCase(); })
    .filter(function (x) { return !/razorpay|noreply|no-reply|support@/.test(x) && CFG.OWN_EMAILS.indexOf(x) < 0; });
  var phoneM = text.match(/(?:\+?91[\s-]?)?([6-9]\d{4}[\s-]?\d{5})\b/);
  var nameM = text.match(/(?:Full name|Name|Customer Name)\s*[:\-]?\s*\n?\s*([A-Za-z][A-Za-z .']{1,60})/i);
  return { id: id, amount: amt, email: emails[0] || "", phone: phoneM ? digits(phoneM[1]) : "", name: nameM ? nameM[1].trim() : "" };
}

/* =============================== ticket + email =============================== */

function ticketOf(r) {
  return { ticket_no: r[2], payment_id: r[3], ref: r[3], name: r[4], email: r[5], phone: digits(r[6]), seats: Number(r[7]), amount: Number(r[8]),
           event: CFG.EVENT, date: CFG.DATE, time: CFG.TIME, venue: CFG.VENUE, area: CFG.AREA, email_sent: String(r[10]) === "yes" };
}

function sendTicket(t) {
  var html = ticketHtml(t);
  var pdf = Utilities.newBlob(html, MimeType.HTML, "ticket.html").getAs(MimeType.PDF).setName(t.ticket_no + "_Sundarlysh_Advent_Workshop.pdf");
  var pu = PropertiesService.getScriptProperties().getProperty("PAGE_URL");
  var link = pu ? pu + (pu.indexOf("?") < 0 ? "?" : "&") + "ticket=" + encodeURIComponent(t.ticket_no) + "&key=" + encodeURIComponent(t.payment_id) : "";
  var body = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2E1A22">' +
    '<p>Hi ' + esc(t.name === "Guest" ? "there" : t.name) + ',</p><p>Thank you for booking! 🎄 Your payment is received and your seat for the <b>' + esc(t.event) + '</b> is confirmed. Your e-ticket is below and attached as a PDF.</p>' +
    html.replace(/^[\s\S]*<body>|<\/body>[\s\S]*$/g, "") +
    (link ? '<p style="text-align:center"><a href="' + link + '" style="background:#45012A;color:#F0D8A0;padding:12px 22px;border-radius:30px;text-decoration:none;font-weight:bold">View your ticket online</a></p>' : "") +
    '<p>Please show this ticket at entry, on your phone or printed. Doors open 4:45 PM.</p><p>See you soon!<br><b>Team Sundarlysh Memories</b><br>Instagram: @sundarlyshmemories</p></div>';
  var opt = { htmlBody: body, name: CFG.FROM_NAME, attachments: [pdf] };
  if (CFG.REPLY_TO) opt.replyTo = CFG.REPLY_TO;
  MailApp.sendEmail(t.email, "Your e-ticket " + t.ticket_no + " · " + t.event + " · 29 Nov", "Your ticket " + t.ticket_no + " is attached.", opt);
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
    '<tr>' + cell("PAYMENT ID", t.payment_id) + '<td></td></tr></table>' +
    '<div style="border-top:2px dashed #d9c6cc;padding:12px 18px;font-size:12px;color:#6c5560">Please show this ticket at entry (on your phone or printed). Includes ₹100 redeemable food &amp; beverage per person at ' + esc(t.venue) + '.</div>' +
    '</div></body></html>';
}

/* =============================== helpers =============================== */

function hasKeys() { var p = PropertiesService.getScriptProperties(); return !!(p.getProperty("RAZORPAY_KEY_ID") && p.getProperty("RAZORPAY_KEY_SECRET")); }
function rzp(path) {
  var p = PropertiesService.getScriptProperties();
  var res = UrlFetchApp.fetch("https://api.razorpay.com/v1" + path, { muteHttpExceptions: true,
    headers: { Authorization: "Basic " + Utilities.base64Encode(p.getProperty("RAZORPAY_KEY_ID") + ":" + p.getProperty("RAZORPAY_KEY_SECRET")) } });
  var body = JSON.parse(res.getContentText() || "{}");
  if (res.getResponseCode() >= 300) throw new Error((body.error && body.error.description) || "Razorpay error");
  return body;
}
function rowOfPayment(sh, id) { var v = sh.getDataRange().getValues(); for (var i = 1; i < v.length; i++) if (v[i][3] === id) return i + 1; return -1; }
function sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(CFG.SHEET);
  if (!sh) { sh = ss.insertSheet(CFG.SHEET); sh.appendRow(HEAD); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD.length).setFontWeight("bold"); }
  return sh;
}
function digits(s) { return String(s == null ? "" : s).replace(/\D/g, "").slice(-10); }
function stripHtml(h) { return String(h || "").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|tr|td|li|h\d)>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/[ \t]+/g, " "); }
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* =============================== setup helpers (run from the editor) =============================== */

/** STEP 1 – run once: creates the sheet and shows what the script can see in your Razorpay emails. */
function testSetup() {
  sheet();
  var pays = hasKeys() ? paymentsFromApi() : paymentsFromGmail();
  Logger.log("Source: " + (hasKeys() ? "Razorpay API" : "Gmail (Razorpay emails)") + " – payments found: " + pays.length);
  pays.slice(0, 10).forEach(function (p) { Logger.log(JSON.stringify(p)); });
  if (!pays.length) Logger.log("No Razorpay payment emails found yet. Check Razorpay → Account & Settings → Email notifications, and that this script runs in the Gmail that receives them. Then run showRazorpayEmails().");
}

/** If nothing is found: run this and send the log (it shows the subjects/first lines of recent Razorpay emails). */
function showRazorpayEmails() {
  GmailApp.search(CFG.GMAIL_QUERY, 0, 10).forEach(function (th) {
    var m = th.getMessages()[0];
    Logger.log("SUBJECT: " + m.getSubject() + "\nFROM: " + m.getFrom() + "\nBODY: " + (m.getPlainBody() || stripHtml(m.getBody())).slice(0, 700).replace(/\s+/g, " ") + "\n-----");
  });
}

/** STEP 2 – run once: issues tickets for payments already received and turns on the 5-minute job. */
function startAutoTickets() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "autoTickets") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("autoTickets").timeBased().everyMinutes(5).create();
  autoTickets();
  Logger.log("Done. Tickets are now issued and emailed automatically every 5 minutes. See the Bookings sheet.");
}
