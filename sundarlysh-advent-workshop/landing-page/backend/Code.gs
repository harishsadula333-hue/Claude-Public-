/**
 * Sundarlysh Memories – ticket backend for Razorpay PAYMENT PAGES (no Razorpay API keys needed)
 * --------------------------------------------------------------------------------------------
 * Google Apps Script web app, bound to a Google Sheet. It:
 *  - pending : logs a booking attempt just before the visitor goes to the Payment Page
 *  - issue   : after Razorpay redirects back, gives the next ticket number (SM-ADV-001…),
 *              saves it in the "Bookings" sheet and EMAILS the ticket (PDF attached) from your Gmail
 *  - lookup  : re-shows a ticket from the link in the email
 *
 * IMPORTANT: Payment Pages don't send a payment proof back to the website, so tickets are issued when
 * the customer returns from the Payment Page. Tick the "verified" column for each ticket after you
 * match it with Razorpay Dashboard → Payment Pages → your page → Payments (name / phone / email / amount).
 * Razorpay also emails every payer an official receipt.
 *
 * Optional Script property (Project Settings → Script properties):
 *   PAGE_URL   public link of the booking page (adds a "View your ticket online" button to the email)
 */

var CFG = {
  EVENT: "Christmas Advent Calendar Workshop",
  DATE: "Sunday, 29 November 2026",
  TIME: "5:00 PM – 7:00 PM",
  VENUE: "Stuff idly India",
  AREA: "Kondapur, Hyderabad",
  PRICE: 999,
  MAX_SEATS: 6,
  PREFIX: "SM-ADV-",
  FROM_NAME: "Sundarlysh Memories",
  REPLY_TO: "",          // optional: business email for replies
  SHEET: "Bookings"
};
// columns: 1 created_at | 2 status | 3 ticket_no | 4 ref | 5 name | 6 email | 7 phone | 8 seats | 9 kids | 10 amount
//          11 payment_id | 12 source | 13 issued_at | 14 email_sent | 15 verified (tick after checking Razorpay)
var HEAD = ["created_at", "status", "ticket_no", "ref", "name", "email", "phone", "seats", "kids", "amount", "payment_id", "source", "issued_at", "email_sent", "verified"];

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

function pending(d) {
  var b = clean(d);
  var sh = sheet(), r = findRow(sh, b.ref);
  if (r < 0) sh.appendRow([new Date(), "PENDING", "", b.ref, b.name, b.email, "'" + b.phone, b.seats, b.kids, b.amount, "", b.source, "", "", ""]);
  return { ok: true };
}

function issue(d) {
  var b = clean(d);
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = sheet(), r = findRow(sh, b.ref);
    if (r > 0) {
      var cur = sh.getRange(r, 1, 1, HEAD.length).getValues()[0];
      if (cur[1] === "TICKET ISSUED") return { ok: true, ticket: ticketOf(cur) };   // page refreshed: same ticket
    } else {
      sh.appendRow([new Date(), "PENDING", "", b.ref, b.name, b.email, "'" + b.phone, b.seats, b.kids, b.amount, "", b.source, "", "", ""]);
      r = sh.getLastRow();
    }
    var v = sh.getDataRange().getValues(), n = 0;
    for (var i = 1; i < v.length; i++) if (v[i][1] === "TICKET ISSUED") n++;
    var ticketNo = CFG.PREFIX + ("00" + (n + 1)).slice(-3);
    sh.getRange(r, 2).setValue("TICKET ISSUED"); sh.getRange(r, 3).setValue(ticketNo);
    if (b.payment_id) sh.getRange(r, 11).setValue(b.payment_id);
    sh.getRange(r, 13).setValue(new Date());
    SpreadsheetApp.flush();
    var t = ticketOf(sh.getRange(r, 1, 1, HEAD.length).getValues()[0]);
    try { sendTicket(t); sh.getRange(r, 14).setValue("yes"); t.email_sent = true; }
    catch (e) { sh.getRange(r, 14).setValue("FAILED: " + e); t.email_sent = false; }
    return { ok: true, ticket: t };
  } finally { lock.releaseLock(); }
}

function lookup(d) {
  var v = sheet().getDataRange().getValues();
  for (var i = 1; i < v.length; i++)
    if (v[i][2] === d.ticket_no && (v[i][3] === d.key || v[i][10] === d.key) && v[i][1] === "TICKET ISSUED") return { ok: true, ticket: ticketOf(v[i]) };
  throw new Error("Ticket not found");
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
    '<p>Hi ' + esc(t.name) + ',</p><p>Thank you for booking! 🎄 Your seat for the <b>' + esc(t.event) + '</b> is confirmed. Your ticket is below and attached as a PDF.</p>' +
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
    '<tr>' + cell("VENUE", t.venue + ", " + t.area) + cell("AMOUNT", "₹" + Number(t.amount).toLocaleString("en-IN")) + '</tr>' +
    '<tr>' + cell(t.payment_id ? "PAYMENT ID" : "BOOKING REF", t.payment_id || t.ref) + '<td></td></tr></table>' +
    '<div style="border-top:2px dashed #d9c6cc;padding:12px 18px;font-size:12px;color:#6c5560">Please show this ticket at entry (on your phone or printed). Includes ₹100 redeemable food &amp; beverage per person at ' + esc(t.venue) + '.</div>' +
    '</div></body></html>';
}

/* ---------------- helpers ---------------- */

function clean(d) {
  var c = function (s, n) { return String(s == null ? "" : s).replace(/[<>]/g, "").trim().slice(0, n); };
  var seats = parseInt(d.seats, 10);
  var b = { ref: c(d.ref, 40), name: c(d.name, 80), email: c(d.email, 120), phone: String(d.phone || "").replace(/\D/g, "").slice(-10),
            seats: seats, kids: c(d.kids, 5), amount: seats * CFG.PRICE, payment_id: c(d.payment_id, 40), source: c(d.source, 60) };
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
  if (!sh) { sh = ss.insertSheet(CFG.SHEET); sh.appendRow(HEAD); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD.length).setFontWeight("bold");
             sh.getRange(2, 15, 500, 1).insertCheckboxes(); }
  return sh;
}
function prop(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** Run once from the editor: creates the Bookings sheet and sends YOU a sample ticket email. */
function testSetup() {
  sheet();
  var me = Session.getActiveUser().getEmail();
  sendTicket({ ticket_no: "SM-ADV-000", ref: "SMTEST", name: "Test Guest", email: me, seats: 1, amount: CFG.PRICE, payment_id: "",
               event: CFG.EVENT, date: CFG.DATE, time: CFG.TIME, venue: CFG.VENUE, area: CFG.AREA });
  Logger.log("Bookings sheet ready. Sample ticket emailed to " + me);
}
