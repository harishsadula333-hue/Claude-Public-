"""Sundarlysh Memories – day-by-day customer acquisition calendar. usage: build_calendar.py <out.xlsx>"""
import sys
from datetime import date
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule
from openpyxl.utils import get_column_letter

OUT = sys.argv[1]
F = "Arial"; PLUM = "45012A"; GOLD = "C9A55E"; CREAM = "FBF6F1"; GREEN = "104A32"
HF = Font(name=F, bold=True, color="FFFFFF", size=10); HFILL = PatternFill("solid", fgColor=PLUM)
BODY = Font(name=F, size=10); BOLD = Font(name=F, size=10, bold=True)
INPUT = PatternFill("solid", fgColor="FFF8DC"); EVENT = PatternFill("solid", fgColor="F3D9A4"); AFTER = PatternFill("solid", fgColor="E4EFE8")
thin = Side(style="thin", color="E2D3CC"); BR = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="top")
BLUE = Font(name=F, size=10, color="0000FF")

wb = Workbook()
ws = wb.active; ws.title = "Calendar"
ws.sheet_view.showGridLines = False
ws["A1"] = "Sundarlysh Memories – 12-day plan to fill the Christmas Advent Calendar Workshop"; ws["A1"].font = Font(name=F, bold=True, size=15, color=PLUM)
ws["A2"] = "Sun 29 Nov · 5–7 PM · Van Lavino Café & Patisserie, Financial District · ₹1,399 per person (includes ₹500 food voucher) · Early bird: first 5 get 10% off any December workshop"
ws["A2"].font = Font(name=F, italic=True, size=10, color="7C6661")

# inputs
ws["A3"] = "Event date"; ws["A3"].font = BOLD
ws["B3"] = date(2026, 11, 29); ws["B3"].number_format = "ddd dd-mmm-yyyy"; ws["B3"].font = BLUE; ws["B3"].fill = INPUT
ws["D3"] = "Seat target"; ws["D3"].font = BOLD
ws["E3"] = 20; ws["E3"].font = BLUE; ws["E3"].fill = INPUT
ws["F3"] = "← edit: total seats you want to sell (set to the café's seating capacity)"; ws["F3"].font = Font(name=F, italic=True, size=9, color="7C6661")
ws["H3"] = "Ticket price (₹)"; ws["H3"].font = BOLD
ws["I3"] = 1399; ws["I3"].font = BLUE; ws["I3"].fill = INPUT; ws["I3"].number_format = "₹#,##0"

H = ["Date", "Day", "Days to go", "Phase", "Today's goal", "Instagram post / reel", "Stories", "WhatsApp", "Communities & groups",
     "Offline & partners", "Ads (₹1,000 total)", "Content / asset to use", "Owner",
     "Target bookings (cumulative %)", "Target seats (cumulative)", "Actual seats booked (cumulative)", "Gap", "Status", "Notes"]
HR = 5
for c, h in enumerate(H, 1):
    cell = ws.cell(row=HR, column=c, value=h); cell.font, cell.fill, cell.border = HF, HFILL, BR
    cell.alignment = Alignment(wrap_text=True, vertical="center")
ws.row_dimensions[HR].height = 42

P = [
 (date(2026,11,18), "Set-up", "Get everything ready & approved",
  "—", "—", "Create WhatsApp Business on the spare number: logo as photo, name 'Sundarlysh Memories', city only (no address).",
  "Shortlist top 15 leads from the Leads workbook (High priority). Remove exact map location from Instagram/Google.",
  "Final approval of reel, teasers, flyer & price. Print 20 flyers + 2 standing counter cards for Van Lavino.",
  "Set up the ad account & audience (Hyderabad, 10 km around Financial District, women 22–45, interests: crafts, cafés, parenting). Don't start yet.",
  "Main reel, flyer, booking page", "Marketing", 0.0),
 (date(2026,11,19), "Tease", "Create curiosity",
  "Post Christmas Workshop TEASER (23 s): 'Something magical is coming to Hyderabad ✨'", "Countdown sticker to 29 Nov · poll: 'Ever made an advent calendar?'",
  "Message A 'Save our number' to all existing contacts and leads.",
  "Join: Hyderabad Mommies, Moms of India Hyderabad, Telugu Moms Network, Anything Art in Hyderabad (Meetup), letsmeet.in.",
  "Place counter flyer at Van Lavino. Ask Van Lavino to Collab-post the launch reel tomorrow.",
  "—", "Christmas Workshop Teaser (23 s)", "Marketing", 0.0),
 (date(2026,11,20), "Launch", "Open bookings – early bird",
  "Post the MAIN REEL (60 s) as a Collab with Van Lavino. Caption: date, venue, ₹1,399 incl. ₹500 food voucher, 'DM to book'.",
  "Share reel · 'Early bird: first 5 bookings' sticker · link sticker to booking page/DM",
  "Message B 'Workshop launch' + reel to everyone who replied YES.",
  "List on District, BookMyShow (if live), Meetup, Townscript, Lyfskills. Email Telangana Today, Siasat & Hyderabad Mail weekend guides.",
  "Use the ORIGINAL shoot video (due today) for the ad.",
  "START ad: ₹100/day on the best reel (original shoot video or main reel), objective = Messages / Profile visits.",
  "Main reel + flyer image", "Founder + Marketing", 0.10),
 (date(2026,11,21), "Push", "Reach parents & weekend crowd",
  "Post CARICATURE video (Riya & Meera)", "Repost any story mentions · 'Ask me anything about the workshop' box",
  "Reply to every DM/WhatsApp within 1 hour; log each lead in 'Customer Leads (opt-in)'.",
  "Post flyer + short note in 2 mom groups (follow each group's promo rules; offer group members early-bird if allowed).",
  "Visit Katha Bakehouse & Heart Cup (future workshop venues) with flyer; contact Myscape Courtyard & Rajapushpa Provincia associations for notice boards.",
  "Ad running (check cost per message)", "Caricature video (37 s)", "Marketing", 0.20),
 (date(2026,11,22), "Push", "Show what's inside",
  "Carousel: 'What's inside? 24 props & gifts' (real prop photos) or the voice-over video",
  "Behind-the-scenes props · poll: 'Gift bags or goodies box?'",
  "Personal follow-up to people who asked questions but didn't book.",
  "Post in Anything Art Meetup + letsmeet.in (event listing). Share in r/hyderabad weekend thread (per rules).",
  "Ask 2–3 local micro-creators (5k–30k followers, Hyderabad moms/café pages) to attend free in exchange for a reel/story.",
  "Ad running", "Real prop photos / voice-over video", "Marketing", 0.30),
 (date(2026,11,23), "Review", "Monday strategy review + B2B",
  "Post General WORKSHOPS teaser (shows all our activities)", "Share a booking update: 'X seats booked!' (only true numbers)",
  "Broadcast to event-planner leads (Excel) – workshop + partnership offer.",
  "LinkedIn: message HR/employee-engagement pages of Amazon, ICICI, Accenture, DBS for December team workshops.",
  "Weekly strategy review (2–3 hrs): what's working, adjust the plan. Contact CoKarma The District for member newsletter.",
  "Check ad results; keep the better creative, pause the weaker one.", "Workshops Teaser (28 s)", "Founder + Marketing", 0.40),
 (date(2026,11,24), "Push", "Urgency – early bird",
  "Post FLYER as a feed post", "Countdown sticker + 'Early bird closing soon' (only if spots remain)",
  "—",
  "Flyer to preschools near FD (Safari Kid BSR Tech Park, KLAY Nanakramguda, Little Otters, SKILLNOOK) for parent groups.",
  "Pitch FLO / YFLO Hyderabad: members' advent-calendar session or a group booking.",
  "Ad running", "Flyer", "Marketing", 0.50),
 (date(2026,11,25), "Push", "Remind & build trust",
  "Behind-the-scenes reel: packing the 24 props (real footage)", "Story Q&A answers: kids? food voucher? what to bring?",
  "Message C 'Reminder – few seats left' to all interested leads.",
  "Re-share reel in joined groups (only where allowed).",
  "Confirm micro-creators' attendance; send them the event details.",
  "Ad running", "Behind-the-scenes clips", "Marketing", 0.60),
 (date(2026,11,26), "Push", "Social proof",
  "Re-post main reel (or a 15 s cut) with 'Seats filling fast'", "Share DMs/testimonials from people who booked (with permission)",
  "Call warm leads who said 'maybe' – answer questions, close booking.",
  "Reply to comments on your earlier group posts (no repeat posting).",
  "Remind Van Lavino staff to mention the workshop to customers at the counter.",
  "Ad running", "Main reel", "Marketing", 0.70),
 (date(2026,11,27), "Final push", "Last call",
  "Post: 'Only 2 days to go' graphic / story-style post", "Countdown · 'Last few seats' (true numbers only)",
  "Final broadcast to all leads who haven't booked.",
  "Last reminders in groups where you already posted (no repeat spamming).",
  "Print name tags, a 'Scan for Google review' QR card, feedback form QR.",
  "Move the remaining budget to the best ad.", "Countdown graphic", "Marketing", 0.85),
 (date(2026,11,28), "Prep", "Everyone ready for tomorrow",
  "—", "'Tomorrow!' countdown · show the set-up preparation",
  "Message E 'See you tomorrow' to everyone booked (time, venue, Google Maps link privately).",
  "—",
  "Venue check with Van Lavino; pack the kits; brief helpers; charge phones for filming.",
  "Ad ends.", "—", "Founder + Marketing", 1.00),
 (date(2026,11,29), "EVENT DAY", "Delight guests + capture content",
  "Post a short live reel after the event", "LIVE stories every 20 min: set-up, guests creating, finished calendars",
  "Collect consent: 'Can we add you for December workshops?'",
  "—",
  "Film real footage & testimonials (with permission). Guests scan review QR. Announce December workshop + early-bird 10%.",
  "—", "Camera/phone, review QR, feedback QR", "Whole team", 1.00),
 (date(2026,11,30), "After", "Thank & convert",
  "Recap reel with REAL footage (best content for future ads)", "Repost guests' stories",
  "Thank-you message + photos + December workshop early-bird code to every guest.",
  "Post a thank-you + photos in groups where allowed.",
  "Ask for Google reviews; ask Van Lavino to post the recap as a Collab.",
  "—", "Real event footage", "Marketing", None),
 (date(2026,12,1), "After", "Plan the next workshop",
  "Carousel: 'Look what our guests made!'", "Announce next workshop date",
  "Start a WhatsApp Channel for workshop updates; invite all guests.",
  "Update the Leads workbook statuses; plan December venues (Katha, Heart Cup).",
  "Results review: bookings, cost per booking, best channel.",
  "Plan December ads using real footage.", "—", "Founder + Marketing", None),
]
STAT = ["Not started", "In progress", "Done", "Skipped"]
r0 = HR + 1
for i, (d, phase, goal, ig, st, wa, com, off, ads, asset, owner, pct) in enumerate(P):
    r = r0 + i
    vals = [d, f'=TEXT(A{r},"ddd")', f"=$B$3-A{r}", phase, goal, ig, st, wa, com, off, ads, asset, owner, pct, None, None, None, "Not started", None]
    for c, v in enumerate(vals, 1):
        cell = ws.cell(row=r, column=c, value=v); cell.font, cell.alignment, cell.border = BODY, WRAP, BR
    ws.cell(row=r, column=1).number_format = "dd-mmm"
    ws.cell(row=r, column=3).number_format = '0;"+"0;"Today"'
    ws.cell(row=r, column=5).font = BOLD
    if pct is not None:
        ws.cell(row=r, column=14).number_format = "0%"; ws.cell(row=r, column=14).font = BLUE
        ws.cell(row=r, column=15, value=f"=ROUND($E$3*N{r},0)").number_format = "0"
        ws.cell(row=r, column=17, value=f'=IF(P{r}="","",P{r}-O{r})').number_format = '+0;-0;0'
    ws.cell(row=r, column=16).fill = INPUT; ws.cell(row=r, column=18).fill = INPUT; ws.cell(row=r, column=19).fill = INPUT
    fill = EVENT if phase == "EVENT DAY" else (AFTER if phase == "After" else (PatternFill("solid", fgColor=CREAM) if i % 2 else None))
    if fill:
        for c in list(range(1, 16)) + [17]: ws.cell(row=r, column=c).fill = fill
last = r0 + len(P) - 1
dv = DataValidation(type="list", formula1='"' + ",".join(STAT) + '"', allow_blank=True); ws.add_data_validation(dv); dv.add(f"R{r0}:R{last}")
ws.conditional_formatting.add(f"Q{r0}:Q{last}", CellIsRule(operator="lessThan", formula=["0"], font=Font(name=F, color="C00000", bold=True)))
ws.conditional_formatting.add(f"Q{r0}:Q{last}", CellIsRule(operator="greaterThanOrEqual", formula=["0"], font=Font(name=F, color="1E6B48", bold=True)))
widths = [9, 6, 8, 11, 22, 34, 28, 30, 36, 38, 26, 26, 12, 11, 10, 11, 7, 12, 24]
for i, w in enumerate(widths, 1): ws.column_dimensions[get_column_letter(i)].width = w
for r in range(r0, last + 1): ws.row_dimensions[r].height = 118
ws.freeze_panes = "F6"
nr = last + 2
ws.cell(row=nr, column=1, value="Notes").font = BOLD
ws.cell(row=nr + 1, column=1, value="• 'Target bookings %' (blue) is a planning assumption for a normal ramp-up: slow first, most bookings in the last 5 days. Edit it if needed.").font = BODY
ws.cell(row=nr + 2, column=1, value="• Fill 'Actual seats booked' every evening. Gap turns red when you are behind target, so push harder on WhatsApp follow-ups and communities that day.").font = BODY
ws.cell(row=nr + 3, column=1, value="• Only post real numbers ('X seats booked', 'last few seats'). Don't post in groups that don't allow promotions. Don't message people who haven't opted in.").font = BODY
ws.cell(row=nr + 4, column=1, value="• Ads: ₹1,000 total, about ₹100/day for 10 days (20–29 Nov), as decided in the 17 Nov meeting.").font = BODY

# ---------------------------------------------------------------- Summary block (top right)
ws["K3"] = "Seats booked so far"; ws["K3"].font = BOLD
ws["L3"] = f'=IFERROR(LOOKUP(2,1/(P{r0}:P{last}<>""),P{r0}:P{last}),0)'
ws["L3"].font = Font(name=F, bold=True, size=12, color=GREEN); ws["L3"].number_format = "0"
ws["M3"] = "Revenue (₹)"; ws["M3"].font = BOLD
ws["N3"] = "=L3*I3"; ws["N3"].number_format = "₹#,##0"; ws["N3"].font = Font(name=F, bold=True, size=12, color=GREEN)
ws["O3"] = "% of target"; ws["O3"].font = BOLD
ws["P3"] = "=IF(E3=0,0,L3/E3)"; ws["P3"].number_format = "0%"; ws["P3"].font = Font(name=F, bold=True, size=12, color=GREEN)
ws["Q3"] = "Tasks done"; ws["Q3"].font = BOLD
ws["R3"] = f'=COUNTIF(R{r0}:R{last},"Done")&" / "&COUNTA(A{r0}:A{last})'; ws["R3"].font = Font(name=F, bold=True, size=12, color=GREEN)

# ---------------------------------------------------------------- Daily checklist
cl = wb.create_sheet("Daily Checklist"); cl.sheet_view.showGridLines = False
cl["A1"] = "Do these EVERY day (19 – 28 Nov)"; cl["A1"].font = Font(name=F, bold=True, size=14, color=PLUM)
items = [
 ("Reply to all Instagram DMs, comments & WhatsApp messages within 1 hour (business hours)", "10 min, 4× a day"),
 ("Post 3–5 Instagram stories (countdown, BTS, polls, reposts)", "15 min"),
 ("Log every new enquiry in Leads workbook → 'Customer Leads (opt-in)'", "5 min"),
 ("Follow up yesterday's 'Follow up' leads (call or WhatsApp)", "20 min"),
 ("Engage in 3 community groups: reply helpfully to posts (no spam)", "15 min"),
 ("Comment on 10 posts from Hyderabad moms / café / event pages", "15 min"),
 ("Check the ad: spend, messages, cost per message", "5 min"),
 ("Update 'Actual seats booked' + Status in the Calendar sheet", "2 min"),
 ("Switch the business phone off after working hours", "—"),
]
for c, h in enumerate(["Task", "Time", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"], 1):
    cell = cl.cell(row=3, column=c, value=h if c < 3 else f"{h} Nov"); cell.font, cell.fill, cell.border = HF, HFILL, BR
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
dvc = DataValidation(type="list", formula1='"✔,✘"', allow_blank=True); cl.add_data_validation(dvc)
for i, (t, m) in enumerate(items):
    r = 4 + i
    cl.cell(row=r, column=1, value=t).font = BODY; cl.cell(row=r, column=1).alignment = WRAP
    cl.cell(row=r, column=2, value=m).font = BODY
    for c in range(1, 13):
        cl.cell(row=r, column=c).border = BR
        if c >= 3: cl.cell(row=r, column=c).fill = INPUT; cl.cell(row=r, column=c).alignment = Alignment(horizontal="center")
    cl.row_dimensions[r].height = 30
dvc.add(f"C4:L{3 + len(items)}")
cl.column_dimensions["A"].width = 70; cl.column_dimensions["B"].width = 16
for c in range(3, 13): cl.column_dimensions[get_column_letter(c)].width = 8
cl.cell(row=5 + len(items), column=1, value="Tick ✔ or ✘ from the dropdown each day.").font = Font(name=F, italic=True, size=9, color="7C6661")

# ---------------------------------------------------------------- Assets
asl = wb.create_sheet("Assets"); asl.sheet_view.showGridLines = False
asl["A1"] = "Ready-made content for the campaign"; asl["A1"].font = Font(name=F, bold=True, size=14, color=PLUM)
A = [
 ("Main promo reel (60 s)", "Workshop highlights: 24 surprises, how it works, date, venue, booking", "20 Nov launch + ads"),
 ("Christmas Workshop Teaser (23 s)", "Short curiosity teaser", "19 Nov"),
 ("Caricature video (37 s)", "Fun cartoon story with speech bubbles", "21 Nov"),
 ("Workshops Teaser (28 s)", "All Sundarlysh Memories workshops & experience bars", "23 Nov"),
 ("Flyer (A5)", "Counter standee + social post, with Scan-to-Book QR", "Café counter + 24 Nov post"),
 ("Booking page", "Registration & payment page", "Bio link / link sticker once live"),
 ("Lead list (Excel)", "Venues, corporates, communities, platforms + customer tracker", "Daily outreach"),
 ("Marketing kit", "WhatsApp messages, call script, video scripts", "Copy-paste"),
 ("Original shoot video", "Real footage from the videographer", "Main ad creative"),
 ("Real prop & behind-the-scenes photos", "Props, packing, set-up", "22 & 25 Nov"),
]
for c, h in enumerate(["Content", "What it is", "Used on"], 1):
    cell = asl.cell(row=3, column=c, value=h); cell.font, cell.fill, cell.border = HF, HFILL, BR
for i, row in enumerate(A):
    for c, v in enumerate(row, 1):
        cell = asl.cell(row=4 + i, column=c, value=v); cell.font, cell.border, cell.alignment = BODY, BR, WRAP
asl.column_dimensions["A"].width = 40; asl.column_dimensions["B"].width = 75; asl.column_dimensions["C"].width = 32

for s in wb.worksheets: s.sheet_properties.tabColor = PLUM
wb.save(OUT); print("saved", OUT)
