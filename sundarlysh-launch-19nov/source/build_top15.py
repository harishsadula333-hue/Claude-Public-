"""Top-15 high-priority leads for the 29 Nov workshop, with ready-to-send messages. usage: build_top15.py out.xlsx"""
import sys, datetime as dt
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation

EV = "Christmas Advent Calendar Workshop on Sunday 29 Nov, 5–7 PM at Van Lavino Café & Patisserie, Financial District (₹1,399 per person, includes a ₹500 food voucher)"
SIG = "\n\nWarm regards,\nTeam Sundarlysh Memories\nInstagram: @sundarlyshmemories"
T = {
"venue": "Hi team Van Lavino! 🎄 Thank you for hosting our {ev}.\nCould we please (1) post the launch reel tomorrow (20 Nov) as an Instagram Collab, (2) keep 2 table tents and a few flyers at the counter, and (3) have the staff mention the workshop to guests? We'll tag you in every post and story.",
"cafe": "Hi {name} team! We're Sundarlysh Memories, an events & workshops studio in Hyderabad. This month we're hosting Hyderabad's first {ev}.\nWe love the creative events you host and would like to bring a monthly hands-on workshop (Christmas crafts, cake & paint, candle and décor bars) to {name} from December. Could we share a short proposal? Happy to drop by for a coffee too.",
"preschool": "Hello {name} team! We're Sundarlysh Memories, a Hyderabad events & workshops studio. We're hosting Hyderabad's first {ev}: guests make their own 24-surprise advent calendar, and it's lovely for parents and kids together.\nCould you share our flyer on your parents' notice board or group? We'd also be happy to run a free 30-minute Christmas craft corner for your little ones in December.",
"school": "Hello {name} PTA / events team! We're Sundarlysh Memories, a Hyderabad events & workshops studio. We're hosting Hyderabad's first {ev}, a family-friendly session.\nWould you be open to sharing it with parents? We also run craft stalls and workshops for school fairs and family days, and would love to be part of your Christmas events.",
"community": "Hello {name} residents' association / clubhouse team! We're Sundarlysh Memories, an events & workshops studio near you. We're hosting Hyderabad's first {ev}, just a few minutes from {name}.\nCould we put up a flyer on the notice board / community app? We'd also love to host a Christmas craft evening at your clubhouse for residents in December.",
"cowork": "Hi {name} community team! We're Sundarlysh Memories. We're hosting Hyderabad's first {ev}, a short walk from you.\nWould you like to share it with members, or book a small group? We can also run a 60–90 minute Christmas craft social in your space for members this December.",
"corporate": "Hello! We're Sundarlysh Memories, a Hyderabad events & workshops studio. For the Christmas season we run hands-on team workshops (advent calendars, cake & paint, candle and décor bars) that work for 15–150 people, at your office or a café near Financial District.\nOur first public session is the {ev}. Could we share a short proposal for December team activities?",
"women": "Hello {name} team! We're Sundarlysh Memories, a women-led events & workshops studio in Hyderabad. We're hosting Hyderabad's first {ev}.\nWe'd love to offer {name} members a group booking, or host a private members-only Christmas craft session in December. Could we share details with your events team?",
}
L = [  # (id, name, category, area, template, channel, why/ask)
(1, "Van Lavino Café & Patisserie", "Venue partner (current)", "Financial District", "venue", "In person (café manager) + Instagram DM", "Collab post on 20 Nov, counter flyers + table tents, staff mention"),
(2, "Katha Specialty Coffee & Bakehouse", "Café / venue", "Financial District", "cafe", "Instagram DM / visit", "Monthly workshop host from December"),
(3, "Heart Cup Coffee", "Café / venue", "Gachibowli", "cafe", "Instagram DM / District organiser page", "Workshop collab; already hosts workshops"),
(20, "SKILLNOOK – Creative Side Up", "Kids centre", "Financial District", "preschool", "Phone / Instagram DM", "Share flyer with parents; kids' Christmas crafts co-host"),
(22, "Safari Kid – BSR Tech Park", "Preschool", "Financial District", "preschool", "Visit the centre / official phone", "Parent notice board + parents' group"),
(23, "Little Otters", "Daycare", "Financial District", "preschool", "Visit the centre / official phone", "Parent notice board + parents' group"),
(24, "KLAY – Phoenix Primea", "Preschool", "Nanakramguda", "preschool", "Visit the centre / official phone", "Parent notice board + parents' group"),
(26, "The Shri Ram Academy", "School", "Financial District", "school", "Official email / PTA", "Share with parents; Christmas fair stall"),
(29, "CoKarma – The District", "Coworking", "Financial District", "cowork", "Community manager (visit / Instagram)", "Share with members; group booking; member social"),
(41, "Rajapushpa Provincia", "Gated community", "Narsingi", "community", "Clubhouse manager / RWA", "Notice board / community app; clubhouse event"),
(43, "Myscape Courtyard", "Gated community", "Financial District", "community", "Facility manager / RWA", "Walking distance – notice board flyer"),
(42, "Godrej Neopolis", "Gated community", "Kokapet", "community", "Clubhouse / RWA", "Notice board; clubhouse workshop"),
(34, "Amazon – Hyderabad campus", "Corporate", "Nanakramguda", "corporate", "LinkedIn company page → HR / employee engagement", "December team workshops"),
(49, "FLO Hyderabad (FICCI Ladies Organisation)", "Women's network", "Hyderabad", "women", "Official chapter page / events team", "Group booking or members' session"),
(50, "YFLO Hyderabad", "Women's network", "Hyderabad", "women", "Official YFLO page", "Members' advent-calendar workshop"),
]
wb = Workbook(); ws = wb.active; ws.title = "Top 15 – 19 Nov"
plum, gold, cream = "45012A", "C9A55E", "FFF8EE"
thin = Side(style="thin", color="D9C9A6"); bd = Border(left=thin, right=thin, top=thin, bottom=thin)
ws["A1"] = "Top 15 high-priority leads: shortlisted 19 Nov · contact on 19–20 Nov · follow up 22 Nov"
ws["A1"].font = Font(bold=True, size=14, color=plum)
ws["A2"] = "Copy the message, then send it from the official business number, Instagram or LinkedIn. Never use personal numbers you found online. Update Status after each contact."
ws["A2"].font = Font(italic=True, size=10, color="555555")
hdr = ["#", "Lead ID (Leads workbook)", "Name", "Category", "Area", "Channel", "What we want", "Ready-to-send message", "Contact on", "Follow up on", "Status", "Notes"]
for i, h in enumerate(hdr, 1):
    c = ws.cell(4, i, h); c.font = Font(bold=True, color="FFFFFF"); c.fill = PatternFill("solid", fgColor=plum); c.alignment = Alignment(wrap_text=True, vertical="center"); c.border = bd
dv = DataValidation(type="list", formula1='"Not contacted,Messaged,Replied,Meeting set,Partner / booked,Not interested"', allow_blank=True); ws.add_data_validation(dv)
for r, (lid, name, cat, area, tpl, ch, ask) in enumerate(L, 5):
    msg = T[tpl].format(name=name, ev=EV) + SIG
    day = dt.date(2026, 11, 19) if r - 5 < 8 else dt.date(2026, 11, 20)
    vals = [r - 4, lid, name, cat, area, ch, ask, msg, day, dt.date(2026, 11, 22), "Not contacted", ""]
    for i, v in enumerate(vals, 1):
        c = ws.cell(r, i, v); c.alignment = Alignment(wrap_text=True, vertical="top"); c.border = bd
        if i in (9, 10): c.number_format = "dd mmm"
        if i in (11, 12): c.fill = PatternFill("solid", fgColor="FFF4CC")
    dv.add(ws.cell(r, 11)); ws.row_dimensions[r].height = 190
for col, w in zip("ABCDEFGHIJKL", [4, 9, 26, 16, 15, 24, 26, 80, 10, 10, 16, 22]): ws.column_dimensions[col].width = w
ws.freeze_panes = "D5"
n = 5 + len(L) + 1
ws.cell(n, 1, "Summary").font = Font(bold=True, color=plum)
for k, st in enumerate(["Not contacted", "Messaged", "Replied", "Meeting set", "Partner / booked", "Not interested"]):
    ws.cell(n + 1 + k, 2, st); ws.cell(n + 1 + k, 3, f'=COUNTIF($K$5:$K${4 + len(L)},B{n + 1 + k})')
wb.save(sys.argv[1]); print("saved", sys.argv[1])
