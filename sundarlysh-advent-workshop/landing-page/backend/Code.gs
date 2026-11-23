/**
 * Sundarlysh Memories – ticket backend (Google Apps Script web app)
 * ----------------------------------------------------------------
 * - create_order : creates a Razorpay order for N seats (price decided HERE, not in the browser)
 * - verify       : checks Razorpay's payment signature, issues the ticket number, saves the booking,
 *                  emails the ticket (PDF attached) and returns the ticket to the page
 * - lookup       : re-shows a ticket from the link in the email (?ticket=...&key=payment_id)
 * - reconcilePending : run every 10 min by a trigger; issues tickets for anyone who paid but closed the
 *                      page before it confirmed
 *
 * Setup (see README):  Project Settings → Script properties:
 *    RAZORPAY_KEY_ID      rzp_live_xxx  (or rzp_test_xxx while testing)
 *    RAZORPAY_KEY_SECRET  the matching secret  — NEVER put this in the website
 *    PAGE_URL             the public URL of the booking page (for the "view ticket" link in the email)
 *    TOTAL_SEATS          (optional) e.g. 20 – stops new orders once sold out
 */

var CFG = {
  EVENT: "Christmas Advent Calendar Workshop",
  DATE: "Sunday, 29 November 2026",
  TIME: "5:00 PM – 7:00 PM",
  VENUE: "Stuff idly India",
  AREA: "Kondapur, Hyderabad",
  PRICE: 999,            // rupees per seat
  MAX_SEATS: 6,          // per booking
  PREFIX: "SM-ADV-",
  FROM_NAME: "Sundarlysh Memories",
  REPLY_TO: "",          // optional: the business email for replies
  SHEET: "Bookings"
};
var HEAD = ["created_at", "status", "ticket_no", "name", "email", "phone", "seats", "kids", "amount", "order_id", "payment_id", "source", "paid_at", "email_sent"];

function doGet() { return out({ ok: true, service: "Sundarlysh tickets" }); }

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents || "{}");
    if (d.action === "create_order") return out(createOrder(d));
    if (d.action === "verify") return out(verify(d));
    if (d.action === "lookup") return out(lookup(d));
    return out({ ok: false, error: "Unknown action" });
  } catch (err) {
    return out({ ok: false, error: String(err && err.message || err) });
  }
}

/* ---------------- actions ---------------- */

function createOrder(d) {
  var name = clean(d.name, 80), email = clean(d.email, 120), phone = String(d.phone || "").replace(/\D/g, "").slice(-10);
  var seats = parseInt(d.seats, 10);
  if (name.length < 2) throw new Error("Please enter your name.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Please enter a valid email.");
  if (phone.length !== 10) throw new Error("Please enter a valid 10-digit phone number.");
  if (!(seats >= 1 && seats <= CFG.MAX_SEATS)) throw new Error("Please choose 1–" + CFG.MAX_SEATS + " seats.");
  var total = parseInt(prop("TOTAL_SEATS") || "0", 10);
  if (total && seatsSold() + seats > total) throw new Error("Sorry, only " + Math.max(0, total - seatsSold()) + " seat(s) left. Please DM us on Instagram.");

  var amount = seats * CFG.PRICE * 100;   // paise
  var order = rzp("post", "/orders", {
    amount: amount, currency: "INR", receipt: "SM" + Date.now(),
    notes: { event: CFG.EVENT, name: name, email: email, phone: phone, seats: String(seats) }
  });
  sheet().appendRow([new Date(), "PENDING", "", name, email, "'" + phone, seats, clean(d.kids, 5), amount / 100, order.id, "", clean(d.source, 60), "", ""]);
  return { ok: true, order_id: order.id, amount: amount, currency: "INR", key_id: prop("RAZORPAY_KEY_ID") };
}

function verify(d) {
  var oid = String(d.razorpay_order_id || ""), pid = String(d.razorpay_payment_id || ""), sig = String(d.razorpay_signature || "");
  if (!oid || !pid || !sig) throw new Error("Missing payment details");
  var expected = hex(Utilities.computeHmacSha256Signature(oid + "|" + pid, prop("RAZORPAY_KEY_SECRET")));
  if (expected !== sig) throw new Error("Payment could not be verified");
  return { ok: true, ticket: issue(oid, pid) };
}

function lookup(d) {
  var sh = sheet(), v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) {
    if (v[i][2] === d.ticket_no && v[i][10] === d.key && v[i][1] === "PAID") return { ok: true, ticket: ticketOf(v[i]) };
  }
  throw new Error("Ticket not found");
}

/** Time-driven trigger (every 10 minutes): catch payments where the buyer closed the page too early. */
function reconcilePending() {
  var sh = sheet(), v = sh.getDataRange().getValues(), now = Date.now();
  for (var i = 1; i < v.length; i++) {
    if (v[i][1] !== "PENDING") continue;
    var age = now - new Date(v[i][0]).getTime();
    if (age < 3 * 60 * 1000 || age > 3 * 24 * 3600 * 1000) continue;
    try {
      var pays = rzp("get", "/orders/" + v[i][9] + "/payments").items || [];
      var ok = pays.filter(function (p) { return p.status === "captured" || p.status === "authorized"; })[0];
      if (ok) issue(v[i][9], ok.id);
    } catch (e) { Logger.log("reconcile " + v[i][9] + ": " + e); }
  }
}

/* ---------------- core ---------------- */

function issue(orderId, paymentId) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = sheet(), v = sh.getDataRange().getValues(), row = -1;
    for (var i = 1; i < v.length; i++) if (v[i][9] === orderId) { row = i; break; }
    if (row < 0) throw new Error("Booking not found for this payment");
    if (v[row][1] === "PAID") return ticketOf(v[row]);            // already issued (page + trigger both ran)

    // double-check with Razorpay that the payment is real, for this order and the full amount
    var pay = rzp("get", "/payments/" + paymentId);
    if (pay.order_id !== orderId) throw new Error("Payment does not match this booking");
    if (Number(pay.amount) !== Math.round(Number(v[row][8]) * 100)) throw new Error("Payment amount does not match");
    if (pay.status === "authorized") { try { rzp("post", "/payments/" + paymentId + "/capture", { amount: pay.amount, currency: "INR" }); } catch (e) {} }

    var n = 0; for (var j = 1; j < v.length; j++) if (v[j][1] === "PAID") n++;
    var ticketNo = CFG.PREFIX + ("00" + (n + 1)).slice(-3);
    var r = row + 1;
    sh.getRange(r, 2).setValue("PAID"); sh.getRange(r, 3).setValue(ticketNo);
    sh.getRange(r, 11).setValue(paymentId); sh.getRange(r, 13).setValue(new Date());
    SpreadsheetApp.flush();
    var rec = sh.getRange(r, 1, 1, HEAD.length).getValues()[0];
    var t = ticketOf(rec);
    try { sendTicket(t); sh.getRange(r, 14).setValue("yes"); t.email_sent = true; }
    catch (e) { sh.getRange(r, 14).setValue("FAILED: " + e); t.email_sent = false; }
    return t;
  } finally { lock.releaseLock(); }
}

function ticketOf(r) {
  return { ticket_no: r[2], name: r[3], email: r[4], phone: String(r[5]).replace("'", ""), seats: Number(r[6]), amount: Number(r[8]),
           payment_id: r[10], event: CFG.EVENT, date: CFG.DATE, time: CFG.TIME, venue: CFG.VENUE, area: CFG.AREA, email_sent: String(r[13]) === "yes" };
}

function sendTicket(t) {
  var html = ticketHtml(t);
  var pdf = Utilities.newBlob(html, MimeType.HTML, "ticket.html").getAs(MimeType.PDF).setName(t.ticket_no + "_Sundarlysh_Advent_Workshop.pdf");
  var link = prop("PAGE_URL") ? prop("PAGE_URL") + (prop("PAGE_URL").indexOf("?") < 0 ? "?" : "&") + "ticket=" + encodeURIComponent(t.ticket_no) + "&key=" + encodeURIComponent(t.payment_id) : "";
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
  var row = function (k, v) { return '<td style="padding:8px 12px;vertical-align:top"><div style="font-size:10px;font-weight:bold;letter-spacing:1.5px;color:#8a6f7a">' + k + '</div><div style="font-size:16px;color:#2E1A22;margin-top:2px">' + esc(v) + '</div></td>'; };
  return '<html><body><div style="border:2px solid #C9A55E;border-radius:14px;overflow:hidden;font-family:Arial,sans-serif;background:#FBF6F1">' +
    '<div style="background:#45012A;color:#F0D8A0;padding:14px 18px"><table width="100%"><tr><td><div style="font-size:16px;font-weight:bold;letter-spacing:3px">SUNDARLYSH MEMORIES</div><div style="font-size:11px;letter-spacing:2px">E-TICKET</div></td>' +
    '<td style="text-align:right"><div style="font-size:11px">Ticket no.</div><div style="font-size:20px;font-weight:bold">' + esc(t.ticket_no) + '</div></td></tr></table></div>' +
    '<div style="padding:16px 18px 4px;font-family:Georgia,serif;font-style:italic;font-size:24px;color:#45012A">' + esc(t.event) + '</div>' +
    '<table width="100%" style="border-collapse:collapse;margin:4px 6px">' +
    '<tr>' + row("NAME", t.name) + row("ADMITS", t.seats + (t.seats == 1 ? " person" : " people")) + '</tr>' +
    '<tr>' + row("DATE", t.date) + row("TIME", t.time) + '</tr>' +
    '<tr>' + row("VENUE", t.venue + ", " + t.area) + row("AMOUNT PAID", "₹" + Number(t.amount).toLocaleString("en-IN")) + '</tr>' +
    '<tr>' + row("PAYMENT ID", t.payment_id) + '<td></td></tr></table>' +
    '<div style="border-top:2px dashed #d9c6cc;padding:12px 18px;font-size:12px;color:#6c5560">Please show this ticket at entry (on your phone or printed). Includes ₹100 redeemable food &amp; beverage per person at ' + esc(t.venue) + '.</div>' +
    '</div></body></html>';
}

/* ---------------- helpers ---------------- */

function rzp(method, path, payload) {
  var id = prop("RAZORPAY_KEY_ID"), secret = prop("RAZORPAY_KEY_SECRET");
  if (!id || !secret) throw new Error("Payments are not set up yet");
  var opt = { method: method, muteHttpExceptions: true, contentType: "application/json",
              headers: { Authorization: "Basic " + Utilities.base64Encode(id + ":" + secret) } };
  if (payload) opt.payload = JSON.stringify(payload);
  var res = UrlFetchApp.fetch("https://api.razorpay.com/v1" + path, opt), body = JSON.parse(res.getContentText() || "{}");
  if (res.getResponseCode() >= 300) throw new Error((body.error && body.error.description) || "Payment service error");
  return body;
}
function sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(CFG.SHEET);
  if (!sh) { sh = ss.insertSheet(CFG.SHEET); sh.appendRow(HEAD); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD.length).setFontWeight("bold"); }
  return sh;
}
function seatsSold() {
  var v = sheet().getDataRange().getValues(), n = 0;
  for (var i = 1; i < v.length; i++) if (v[i][1] === "PAID") n += Number(v[i][6]) || 0;
  return n;
}
function prop(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function hex(bytes) { return bytes.map(function (b) { return ("0" + (b & 0xff).toString(16)).slice(-2); }).join(""); }
function clean(s, n) { return String(s == null ? "" : s).replace(/[<>]/g, "").trim().slice(0, n); }
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** Run once from the editor to check the setup (creates the sheet, checks the keys). */
function testSetup() {
  sheet();
  var o = rzp("get", "/orders?count=1");
  Logger.log("Razorpay keys OK. Recent orders: " + (o.count || 0));
  Logger.log("Sample ticket HTML length: " + ticketHtml({ ticket_no: "SM-ADV-000", name: "Test", seats: 1, amount: CFG.PRICE, payment_id: "pay_test", event: CFG.EVENT, date: CFG.DATE, time: CFG.TIME, venue: CFG.VENUE, area: CFG.AREA }).length);
}
