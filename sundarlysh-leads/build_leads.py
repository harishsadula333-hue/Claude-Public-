"""Build the Sundarlysh Memories lead workbook. usage: build_leads.py <out.xlsx>"""
import sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

OUT = sys.argv[1]
F = "Arial"
PLUM, GOLD, CREAM, LIGHT = "45012A", "C9A55E", "FBF6F1", "F4E9E2"
HFONT = Font(name=F, bold=True, color="FFFFFF", size=10)
HFILL = PatternFill("solid", fgColor=PLUM)
BODY = Font(name=F, size=10)
LINK = Font(name=F, size=10, color="0563C1", underline="single")
TITLE = Font(name=F, bold=True, size=16, color=PLUM)
SUB = Font(name=F, bold=True, size=11, color=PLUM)
INPUT = PatternFill("solid", fgColor="FFF8DC")
thin = Side(style="thin", color="E2D3CC")
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="top")

STATUS_B2B = ["Not contacted", "Contacted", "Follow up", "Interested", "Partnered / Booked", "Not interested"]
STATUS_COMM = ["Not joined", "Requested", "Joined", "Posted", "Not allowed to promote"]
STATUS_LIST = ["Not listed", "Submitted", "Live", "Not suitable"]
STATUS_CUST = ["New", "Contacted", "Follow up", "Booked", "Paid", "Not interested"]

def sheet_table(ws, headers, rows, widths, status_col=None, status_list=None, link_cols=(), input_cols=(), start_row=4):
    for c, h in enumerate(headers, 1):
        cell = ws.cell(row=start_row, column=c, value=h)
        cell.font, cell.fill, cell.alignment, cell.border = HFONT, HFILL, Alignment(wrap_text=True, vertical="center"), BORDER
    ws.row_dimensions[start_row].height = 30
    for r, row in enumerate(rows, start_row + 1):
        for c, v in enumerate(row, 1):
            cell = ws.cell(row=r, column=c, value=v)
            cell.font, cell.alignment, cell.border = BODY, WRAP, BORDER
            if c in link_cols and isinstance(v, str) and v.startswith("http"):
                cell.hyperlink = v; cell.font = LINK
            if c in input_cols:
                cell.fill = INPUT
        if r % 2 == 0:
            for c in range(1, len(headers) + 1):
                if c not in input_cols: ws.cell(row=r, column=c).fill = PatternFill("solid", fgColor=CREAM)
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    last = start_row + max(len(rows), 1)
    ws.freeze_panes = ws.cell(row=start_row + 1, column=3)
    ws.auto_filter.ref = f"A{start_row}:{get_column_letter(len(headers))}{last}"
    if status_col:
        dv = DataValidation(type="list", formula1='"' + ",".join(status_list) + '"', allow_blank=True)
        ws.add_data_validation(dv)
        col = get_column_letter(status_col)
        dv.add(f"{col}{start_row + 1}:{col}{start_row + 400}")
    return last

def title(ws, t, sub):
    ws["A1"] = t; ws["A1"].font = TITLE
    ws["A2"] = sub; ws["A2"].font = Font(name=F, italic=True, size=10, color="7C6661")
    ws.sheet_view.showGridLines = False

wb = Workbook()

# ------------------------------------------------------------------ Read Me
ws = wb.active; ws.title = "Read Me"
title(ws, "Sundarlysh Memories – Lead & Community List", "Researched 18 Nov 2026 from public web sources · Hyderabad focus (29 Nov Advent Calendar Workshop) + Bengaluru communities")
notes = [
    ("What's inside", ""),
    ("B2B Leads", "Businesses & organisations to partner with or sell workshops to: cafés/venues, workshop studios, kids centres, schools, coworking spaces, corporates, gated communities, party/wedding planners, women's networks."),
    ("Online Communities", "Facebook groups, Meetup groups, Reddit, expat & parenting communities where you can join and share events (follow each group's rules)."),
    ("Listing & Media", "Ticketing/event platforms to list the workshop on, and local media weekend-guides to pitch."),
    ("Instagram Hashtags", "Hashtags and post ideas to reach local audiences on Instagram."),
    ("Customer Leads (opt-in)", "Tracker for INDIVIDUAL customers who contact you or register (Instagram DMs, flyer QR, landing page, referrals). Only add people who shared their details with you."),
    ("Dashboard", "Live counts by status (formulas update automatically as you change the Status columns)."),
    ("", ""),
    ("How to use", ""),
    ("1", "Work top-down by Priority (High first). Use the official channel in 'How to reach' – business phone/website/Instagram/LinkedIn page – never personal numbers."),
    ("2", "Change the yellow Status cell (dropdown) and fill 'Last contact' + 'Notes' after every touchpoint. The Dashboard updates itself."),
    ("3", "Verify details before contacting – sources are directories/news articles and may be out of date (each row links its source)."),
    ("", ""),
    ("Important – data & WhatsApp rules", ""),
    ("Privacy (DPDP Act 2023)", "This list contains only public business listings and public communities. Do not scrape or buy personal phone numbers/emails of private individuals – India's Digital Personal Data Protection Act 2023 requires consent to process personal data."),
    ("WhatsApp Business policy", "Broadcast only to people who saved your number / opted in. Messaging cold numbers in bulk gets the business number blocked. Grow the opt-in list with the flyer QR, landing page, Instagram and community posts."),
    ("Communities", "Read group rules first; many groups allow promotions only on specific days or with admin approval. Offer value (e.g. a members' discount) instead of spam."),
]
r = 4
for k, v in notes:
    ws.cell(row=r, column=1, value=k).font = SUB if v == "" else Font(name=F, bold=True, size=10)
    c = ws.cell(row=r, column=2, value=v); c.font = BODY; c.alignment = WRAP
    r += 1
ws.column_dimensions["A"].width = 28; ws.column_dimensions["B"].width = 120

# ------------------------------------------------------------------ B2B Leads
b2b = [
 # Category, Name, Area, Why a fit / pitch angle, How to reach, Priority, Source
 ("Venue partner (current)", "Van Lavino Café & Patisserie", "Financial District (also Jubilee Hills, Nallagandla)", "Venue of the 29 Nov workshop. Ask for a collab Instagram post, counter flyer & table-tent, and future monthly workshops.", "Café manager in person · official Instagram/Google listing", "High", "https://hyderabadmail.com/looking-for-the-perfect-cake-these-hyderabad-cake-shops-wont-disappoint/"),
 ("Café / venue", "Katha Specialty Coffee & Bakehouse", "Financial District", "Already hosts creative sessions, live music & art events – natural host for monthly Sundarlysh workshops.", "Visit / official Instagram or Google listing", "High", "https://echai.ventures/hyderabad/cafes/gachibowli-finance"),
 ("Café / venue", "Heart Cup Coffee", "Gachibowli", "Has hosted a pottery workshop (listed on District) – open to workshop collabs.", "Official Instagram / District organiser page", "High", "https://district.in/pottery-workshop-at-heart-cup-coffee-dec1-2024/event"),
 ("Café / venue", "Blue Tokai Coffee Roasters (Gachibowli)", "Gachibowli", "Runs in-store workshops (manual brewing on District) – pitch a joint coffee + craft evening.", "Store manager / brand partnerships", "Medium", "https://www.district.in/events/manual-brewing-may16-2026-buy-tickets"),
 ("Café / venue", "Roast CCX", "Banjara Hills", "Hosts 50+ curated events/workshops a year – pitch Christmas & seasonal craft workshops.", "Official website / Instagram events team", "Medium", "https://www.outlooktraveller.com/ot-pours/roast-ccxs-coffee-workshops-are-reinventing-hyderabads-coffee-scene"),
 ("Café / venue", "Driven Cafe", "ISB Road, Financial District", "Popular with nearby office workers – weekday-evening workshops for professionals.", "Visit / official listing", "Medium", "https://echai.ventures/hyderabad/cafes/gachibowli-finance"),
 ("Café / venue", "Big Star Cafe", "Financial District", "Work-friendly café near offices – after-work craft sessions.", "Visit / official listing", "Low", "https://echai.ventures/hyderabad/cafes/gachibowli-finance"),
 ("Café / venue", "Cravery Café", "Financial District, Nanakramguda", "Local café with community following – dessert-decorating / cake & paint collab fit.", "Visit / official listing", "Medium", "https://www.deccanchronicle.com/lifestyle/food/food-review-cravery-caf-financial-district-nanakramguda-hyderabad-889759"),
 ("Café / venue", "WAFL Café", "Nanakramguda", "Dessert café – fits Decoden / cake decorating workshops.", "Visit / official listing", "Medium", "https://echai.ventures/hyderabad/cafes/gachibowli-finance"),
 ("Café / venue", "Roastery Coffee House (Kokapet)", "Kokapet", "Near Kokapet/Narsingi luxury communities – weekend family workshops.", "Visit / official listing", "Medium", "https://echai.ventures/hyderabad/cafes/gachibowli-finance"),
 ("Café / venue", "Brews & Blends", "Kondapur", "Kondapur café – evening workshops for residents.", "Visit / official listing", "Low", "https://echai.ventures/hyderabad/cafes/gachibowli-finance"),
 ("Café / venue", "Lyzure (art café)", "Prashasan Nagar, Jubilee Hills", "Art café running tufting, pottery, candle-making – collab or guest-host Sundarlysh signature bars (Ubtan, Decoden).", "Official Instagram / visit", "Medium", "https://www.siasat.com/weekend-plans-list-of-4-art-therapy-cafes-to-visit-in-hyderabad-3206099"),
 ("Café / venue", "Socio", "Banjara Hills", "Hosts hands-on art sessions & events – guest workshops.", "Official Instagram / visit", "Medium", "https://www.siasat.com/weekend-plans-list-of-4-art-therapy-cafes-to-visit-in-hyderabad-3206099"),
 ("Café / venue", "Urban Nemo (garden café)", "Park View Enclave, Jubilee Hills", "Garden café with plant & painting workshops – outdoor family workshops.", "Official Instagram / visit", "Medium", "https://www.siasat.com/weekend-plans-list-of-4-art-therapy-cafes-to-visit-in-hyderabad-3206099"),
 ("Competitor / possible collab", "Ignite Candle Bar and Art Cafe", "Financial District, Nanakramguda", "Runs 'Pour Your Own Candle' & craft sessions in the same area – watch their pricing; possible cross-promotion.", "Official Instagram / visit", "Low", "https://www.siasat.com/weekend-plans-list-of-4-art-therapy-cafes-to-visit-in-hyderabad-3206099"),
 ("Workshop studio / space", "Thirdspace – Art & Social Community", "Jubilee Hills", "Art & social community space – co-host workshops, share audiences.", "Lyfskills listing / official Instagram", "Medium", "https://discover.lyfskills.com/listing/35512"),
 ("Workshop studio / space", "Our Sacred Space", "Secunderabad", "Hosts regular workshops (registrations via Instagram @oursacredspace).", "https://www.instagram.com/oursacredspace", "Low", "https://telanganatoday.com/hyderabad-weekend-guide-comedy-workshops-and-fun"),
 ("Workshop studio / space", "Lamakaan", "Banjara Hills", "Cultural space listing many craft workshops (Lippan, Gond) – list Sundarlysh workshops there.", "Lamakaan events submission", "Medium", "https://admin.lamakaan.com/events/9421"),
 ("Workshop studio / space", "Alliance Française Hyderabad", "Hyderabad", "Hosts craft workshops (e.g. découpage) – pitch Christmas craft workshop for members.", "Official website events team", "Low", "https://hyderabad.afindia.org/events/decoupage-workshop/"),
 ("Kids centre / preschool", "SKILLNOOK – Creative Side Up", "Financial District", "Creative classes & workshops for kids – co-host kids' Christmas crafts (pipe-cleaner trees, cake & paint).", "Lyfskills listing", "High", "https://discover.lyfskills.com/listing/35502"),
 ("Kids centre / preschool", "The Little Gym (Kondapur & Gachibowli)", "Kondapur / Gachibowli", "Parent-child classes – parent community for family workshops.", "Centre manager", "Medium", "https://discover.lyfskills.com/classes/hyderabad/in/gachibowli/gymnastics"),
 ("Kids centre / preschool", "Safari Kid – BSR Tech Park", "Financial District", "Preschool/daycare used by working parents in FD – Christmas parent-child workshop, notice-board flyer.", "Centre head", "Medium", "https://www.proeves.com/telangana/hyderabad/financial-district/creche-financial-district/safari-kid-global-bsr-tech-park-12136"),
 ("Kids centre / preschool", "Little Otters", "Financial District", "Daycare for FD working parents – flyer & parents' WhatsApp group via centre.", "Centre head", "Medium", "https://www.proeves.com/telangana/hyderabad/financial-district/creche-financial-district/little-otters-14752"),
 ("Kids centre / preschool", "KLAY (Phoenix Primea, Nanakramguda)", "Financial District", "Preschool/daycare for corporate parents – family Christmas workshop.", "Centre head", "Medium", "https://klay.co.in/?p=9243"),
 ("School", "Oakridge International School", "Khajaguda, Nanakramguda Road", "Christmas fair / PTA events / after-school craft clubs.", "School events coordinator / PTA", "Medium", "https://www.wikipedia.com/wiki/Oakridge_International_School"),
 ("School", "The Shri Ram Academy", "Financial District", "IB school in FD – PTA family workshops, school carnival stalls.", "School events coordinator / PTA", "Medium", "https://www.nobroker.in/blog/schools-in-gachibowli-hyderabad/"),
 ("School", "Shri Ram Universal School", "Financial District, Nanakramguda", "Family-day / Christmas stalls.", "School office", "Low", "https://en.wikipedia.com/wiki/Financial_District,_Hyderabad"),
 ("School", "CHIREC International School (Gachibowli)", "Gachibowli / Kondapur", "PTA events & school fairs.", "School office / PTA", "Low", "https://www.nobroker.in/blog/schools-in-gachibowli-hyderabad/"),
 ("Coworking", "CoKarma – The District", "Myscape Road, Financial District", "Member community events – lunchtime/evening craft sessions & Christmas member social.", "Community manager", "High", "https://myhq.in/managed-office/cokarma-the-district"),
 ("Coworking", "CoKarma Gachibowli", "Gachibowli", "Community-led coworking – member events.", "Community manager", "Medium", "https://myhq.in/coworking-space/cokarma-gachibowli"),
 ("Coworking", "Spaces – Gachibowli", "Gachibowli", "Runs a programme of community events – pitch a Christmas workshop for members.", "Community manager", "Medium", "https://www.spacesworks.com/en/in/telangana/gachubaoli"),
 ("Coworking", "Regus – Gachibowli", "Gachibowli", "Monthly networking events for members – workshop add-on.", "Centre manager", "Low", "https://www.regus.com/en/in/telangana/gachubaoli/coworking"),
 ("Coworking", "The Hive at Gachibowli", "Gachibowli", "Coworking + café community.", "Community manager", "Low", "https://coworkingcafe.com/coworking-property/in/ts/hyderabad/the-hive-at-gachibowli-hyderabad"),
 ("Corporate (employee engagement)", "Amazon – Hyderabad campus", "Nanakramguda, Financial District", "15,000+ employees – Christmas team activities, women's network & family-day workshops.", "LinkedIn company page → HR / employee-engagement team (no personal contact info)", "High", "https://en.wikipedia.com/wiki/Financial_District,_Hyderabad"),
 ("Corporate (employee engagement)", "ICICI Bank Towers", "Financial District", "Large workforce – festive employee engagement activities.", "LinkedIn → HR / admin team", "Medium", "https://en.wikipedia.com/wiki/Financial_District,_Hyderabad"),
 ("Corporate (employee engagement)", "Google – Hyderabad campus", "Nanakramguda, Financial District", "Team offsites & festive engagement.", "LinkedIn → workplace/engagement team", "Medium", "https://en.wikipedia.com/wiki/Financial_District,_Hyderabad"),
 ("Corporate (employee engagement)", "Accenture (WaveRock SEZ)", "Nanakramguda", "Team-building workshops / Christmas fun Friday.", "LinkedIn → HR / engagement", "Medium", "https://en.wikipedia.com/wiki/Financial_District,_Hyderabad"),
 ("Corporate (employee engagement)", "DBS Bank (WaveRock SEZ)", "Nanakramguda", "Employee engagement & women's network events.", "LinkedIn → HR / engagement", "Medium", "https://en.wikipedia.com/wiki/Financial_District,_Hyderabad"),
 ("Corporate (employee engagement)", "DuPont (WaveRock SEZ)", "Nanakramguda", "Festive team activities.", "LinkedIn → HR / engagement", "Low", "https://en.wikipedia.com/wiki/Financial_District,_Hyderabad"),
 ("Corporate (employee engagement)", "Apple / GAP (WaveRock SEZ)", "Nanakramguda", "Festive team activities.", "LinkedIn → HR / engagement", "Low", "https://en.wikipedia.com/wiki/Financial_District,_Hyderabad"),
 ("Gated community", "Rajapushpa Provincia", "Narsingi", "Resident families near FD – clubhouse Christmas workshop for residents.", "Residents' association / clubhouse manager / community app notice board", "High", "https://zolostays.com/blog/?p=3458"),
 ("Gated community", "Godrej Neopolis", "Kokapet", "Premium families – clubhouse workshops.", "Residents' association / facility manager", "Medium", "https://zolostays.com/blog/?p=3458"),
 ("Gated community", "Myscape Courtyard", "Financial District", "Walking distance to venue – resident flyer & clubhouse event.", "Residents' association / facility manager", "High", "https://zolostays.com/blog/?p=3458"),
 ("Party / event planner (referral)", "PartyNeeds", "Madhapur–Gachibowli", "Birthday & party decorator – add Sundarlysh activity bars to their packages (referral commission).", "Official listing on WeddingWire", "Medium", "https://weddingwire.in/wedding-planners/partyneeds-hyderabad--e52003"),
 ("Party / event planner (referral)", "Eventbay Technologies", "Hyderabad", "Birthday & stage decoration – add-on workshops for kids' parties.", "IndiaMART business profile", "Low", "https://m.indiamart.com/eventbaytechnologies/profile.html"),
 ("Wedding planner (referral)", "Event by Kadali", "Hyderabad", "Wedding planner – offer Ubtan/Mehendi/Glitter bars as add-ons for their weddings.", "WedMeGood business profile", "Medium", "https://www.wedmegood.com/profile/Event-by-Kadali-26566639"),
 ("Wedding planner (referral)", "Isheeka Events", "Hyderabad", "Wedding planner – activity-bar add-ons.", "WedMeGood business profile", "Medium", "https://www.wedmegood.com/profile/Isheeka-Events-660771"),
 ("Wedding planner (referral)", "Lavik Planners", "Hyderabad", "Wedding decorators – activity-bar add-ons.", "WeddingBazaar business profile", "Low", "https://www.weddingbazaar.com/wedding-decorators/hyderabad/lavik-planners"),
 ("Women's network", "FLO Hyderabad (FICCI Ladies Organisation)", "Hyderabad", "1,100+ women entrepreneurs & professionals – members' workshop, Christmas social, wedding-planning referrals.", "Official FLO Hyderabad chapter page / events team", "High", "https://bizzbuzz.news/bizz-talk/how-flo-hyderabad-changing-the-face-of-women-led-businesses-in-telangana-1346024"),
 ("Women's network", "YFLO Hyderabad (Young FICCI Ladies)", "Hyderabad", "Runs hands-on workshops & networking meets – pitch a members' advent-calendar workshop.", "Official YFLO Hyderabad page", "High", "https://ficciflo.com/yflo-hyderabad/"),
 ("Women's network", "Ladies Circle (Hyderabad One LC 166, Hyderabad Youth LC 167, Secunderabad Metropolitan LC)", "Hyderabad / Secunderabad", "Young women's service clubs – fellowship meetings with a craft activity.", "Ladies Circle India – circle chairpersons", "Medium", "https://telanganatoday.com/hyderabad-ladies-circles-come-together-for-community-service"),
 ("Women's network", "Inner Wheel Club of Kohinoor", "Hyderabad", "Women's club linked to Rotary – fellowship events & festive socials.", "Rotary District 3150 club finder", "Low", "https://rid3150.rotaryindia.org/ClubFinderDetail.aspx?grp=2644"),
 ("Women's network", "WE Hub (Telangana women entrepreneurs hub)", "Hyderabad", "Women-entrepreneur ecosystem – networking events; vendor/partner introductions.", "WE Hub official channels", "Low", "https://ficciflo.com/?p=96815"),
]
ws = wb.create_sheet("B2B Leads")
title(ws, "B2B Leads – partners, venues & bulk customers", "Yellow columns are yours to update. Status has a dropdown. Sources link to the public page each lead came from.")
headers = ["#", "Category", "Name", "Area", "Why they fit / what to pitch", "How to reach (official channel)", "Priority", "Source", "Status", "Last contact", "Notes"]
rows = [(i + 1, *r[:6], r[6], "Not contacted", None, None) for i, r in enumerate(b2b)]
last_b2b = sheet_table(ws, headers, rows, [5, 24, 34, 24, 60, 34, 10, 40, 16, 13, 30], status_col=9, status_list=STATUS_B2B, link_cols=(6, 8), input_cols=(9, 10, 11))
dvp = DataValidation(type="list", formula1='"High,Medium,Low"', allow_blank=True); ws.add_data_validation(dvp); dvp.add(f"G5:G400")
for r in range(5, last_b2b + 1): ws.cell(row=r, column=10).number_format = "dd-mmm-yyyy"

# ------------------------------------------------------------------ Online Communities
comm = [
 ("Facebook group", "Hyderabad Mommies", "Hyderabad", "Mothers & mothers-to-be; private group (~15K members per a 2020 list); runs meetups incl. Zumba, playdates & pottery classes.", "Request to join on Facebook; ask admins about promotion days / a members' discount.", "High", "https://hyderabadmail.com/hyderabad-mommies-mental-health-support/"),
 ("Facebook group / community", "Hyderabad Moms (parenting support community)", "Hyderabad", "Parenting support community (founder-described).", "Search Facebook 'Hyderabad Moms'; check rules before posting.", "High", "https://humansofhyderabad.co.in/?p=4877"),
 ("Facebook group", "Moms of India – Hyderabad chapter", "Hyderabad", "Hyderabad chapter of a national moms' group; holds outings with games.", "Join on Facebook; offer a members-only workshop slot.", "Medium", "https://www.thehansindia.com/featured/womenia/connecting-mothers-for-parenting-519290"),
 ("Facebook group", "Telugu Moms Network", "Telugu states (incl. Hyderabad)", "29,000+ Telugu-speaking mothers (founder-reported).", "Join on Facebook; post per group rules (Telugu caption helps).", "Medium", "https://telanganatoday.com/telugu-moms-network-a-platform-for-mothers-to-support-one-another"),
 ("Meetup group", "Anything Art in Hyderabad", "Hyderabad", "~5,400 art lovers & creators; artist-led workshops & open studios.", "Join on Meetup; ask organisers to co-list the workshop.", "High", "https://www.meetup.com/anything-art-in-hyderabad/"),
 ("Meetup group", "letsmeet.in", "Hyderabad", "Small hands-on creative workshops (≈10 people around one table) – exactly our audience.", "Join on Meetup; propose a collab session.", "High", "https://www.meetup.com/letsmeet-in/"),
 ("Community", "Beyond Hyderabad", "Hyderabad", "Arts, music, trekking & heritage community (~2,000 members, launched 2023).", "Contact via their official page; share event.", "Medium", "https://webjosh.com/article/beyond-hyderabad-is-building-a-thriving-community-for-arts-music-trekking-and-heritage-enthusiasts-1738749577-2514"),
 ("Expat network", "InterNations – Hyderabad", "Hyderabad", "Expat community with monthly events – Christmas workshops appeal to expat families.", "Join InterNations; suggest a group activity to local ambassadors.", "Medium", "https://in-cdn.net/hyderabad-expats"),
 ("Expat club", "Hyderabad Wine Club", "Hyderabad", "Expat-friendly club running tastings & classes – pitch a festive craft + social evening.", "Via Expat Exchange listing / club organisers.", "Low", "https://www.expatexchange.com/article/6042/-"),
 ("Reddit", "r/hyderabad", "Hyderabad", "Large city subreddit – share in weekend/events threads (follow self-promotion rules).", "https://www.reddit.com/r/hyderabad/ – read rules first.", "Medium", "https://reddit.sudovanilla.org/r/hyderabad"),
 ("Founder community", "eChai Ventures – Hyderabad meetups", "Hyderabad", "Free founder/creator meetups – network with café owners & women founders.", "Attend meetups; RSVP on eChai.", "Low", "https://echai.ventures/hyderabad/cafes/gachibowli-finance"),
 ("Creator community (Instagram)", "@idoneseo – creators & digital marketing meetups", "Hyderabad", "Runs creator meetups & creator awards – find local creators to collab/review the workshop.", "https://www.instagram.com/idoneseo/", "Low", "https://insider.in/world-social-media-day-2024-jun30-2024/event"),
 ("Community", "Corp Mallu Hyd", "Hyderabad", "Community of Malayali corporate professionals in Hyderabad running group outings.", "Via their community site/admins.", "Low", "https://sites.google.com/view/corpmhyd/guidelines"),
 ("Facebook group", "Bangalore Mothers' Community", "Bengaluru", "Large moderated moms' group (screening questions to join).", "Join on Facebook – for Bengaluru workshops.", "Medium", "https://safehugs.in/blogs/communities/women-communities-in-bengaluru"),
 ("Community", "Mommy & Me Bangalore", "Bengaluru", "Moms' community with online chats & local events.", "Join via Facebook page / website.", "Medium", "https://safehugs.in/blogs/communities/women-communities-in-bengaluru"),
 ("Facebook group", "Breastfeeding Support for Indian Moms (BSIM)", "Bengaluru / India", "17,000+ members with monthly offline meets in Bengaluru.", "Join on Facebook; respect support-group rules (no hard selling).", "Low", "https://safehugs.in/blogs/communities/women-communities-in-bengaluru"),
 ("Community", "Wonderful Mothers of Bangalore", "Bengaluru", "Moms' group running in-person seminars & workshops at schools.", "Contact organisers to host a craft session.", "Medium", "https://safehugs.in/blogs/communities/women-communities-in-bengaluru"),
 ("Meetup group", "Bengaluru Pregnant, Breastfeeding & New Moms", "Bengaluru", "Meetup group for new moms.", "Join on Meetup.", "Low", "https://www.meetup.com/bengaluru-pregnant-breastfeeding-moms-meetup-group"),
 ("Community", "Mompower360", "Bengaluru", "Annual moms' conference + monthly community events – stall/workshop partner.", "Via Townscript event page / organisers.", "Medium", "https://townscript.com/e/mompower-conference-2024"),
]
ws = wb.create_sheet("Online Communities")
title(ws, "Online Communities – where to join & share", "WhatsApp groups are private/invite-only: join them through these communities, your café/school partners and the people who opt in. Always read group rules.")
headers = ["#", "Platform", "Name", "City", "Audience / why it fits", "How to join / post", "Priority", "Source", "Status", "Joined on", "Notes"]
rows = [(i + 1, *r[:6], r[6], "Not joined", None, None) for i, r in enumerate(comm)]
last_comm = sheet_table(ws, headers, rows, [5, 22, 38, 18, 58, 40, 10, 40, 18, 12, 30], status_col=9, status_list=STATUS_COMM, link_cols=(6, 8), input_cols=(9, 10, 11))
dvp2 = DataValidation(type="list", formula1='"High,Medium,Low"', allow_blank=True); ws.add_data_validation(dvp2); dvp2.add("G5:G400")
for r in range(5, last_comm + 1): ws.cell(row=r, column=10).number_format = "dd-mmm-yyyy"

# ------------------------------------------------------------------ Listing & Media
lst = [
 ("Ticketing platform", "District (by Zomato)", "Self-serve 'List your events'. Per the 17 Nov meeting, District approval is complete – list the 29 Nov workshop (watch commission).", "https://www.district.in/activities/workshops-activities-in-hyderabad", "High"),
 ("Ticketing platform", "BookMyShow", "Integration was in progress (17 Nov meeting) – complete listing.", "https://in.bookmyshow.com/", "High"),
 ("Ticketing platform", "Swiggy (events / dineout)", "Mentioned in 17 Nov meeting as an option for event tickets – check eligibility.", "https://www.swiggy.com/", "Medium"),
 ("Ticketing platform", "Townscript", "Hosts many Hyderabad craft workshops (candle making, clay modelling, Gond painting).", "https://www.townscript.com/e/candle-making-workshop-201421", "Medium"),
 ("Ticketing platform", "Insider.in (Paytm Insider)", "Many Hyderabad workshops are listed here (pottery, crochet, kalamkari).", "https://insider.in/crochet-basics-workshop-aug27-2023/event", "Medium"),
 ("Community platform", "Meetup", "Create the event inside 'Anything Art in Hyderabad' / own group.", "https://www.meetup.com/anything-art-in-hyderabad/", "High"),
 ("Event directory", "Eventbrite (India)", "Free listing for workshops; good for SEO.", "https://www.eventbrite.com.au/d/india/workshops", "Low"),
 ("Activity directory", "Lyfskills (discover.lyfskills.com)", "Directory of classes & workshops in Hyderabad – list Sundarlysh as a workshop provider.", "https://discover.lyfskills.com/listing/35502", "Medium"),
 ("Media – weekend guide", "Telangana Today – 'Hyderabad weekend guide'", "Recurring weekend roundup of workshops & events – send event details 7–10 days ahead via their contact/editorial email. They also run a WhatsApp channel.", "https://telanganatoday.com/tag/hyderabad-weekend-guide/page/2", "High"),
 ("Media – weekend guide", "Siasat – weekend events/workshops roundup", "Regular 'events this weekend in Hyderabad' lists – pitch via contact page.", "https://www.siasat.com/8-events-you-can-attend-this-weekend-in-hyderabad-3269867/", "High"),
 ("Media – weekend guide", "Hyderabad Mail – workshops & things to do", "Publishes workshop roundups – pitch event + photos.", "https://hyderabadmail.com/dont-miss-these-exciting-workshops-in-hyderabad/", "Medium"),
]
ws = wb.create_sheet("Listing & Media")
title(ws, "Event listing platforms & local media", "List the workshop everywhere for free discovery; pitch media weekend-guides about a week before the event.")
headers = ["#", "Type", "Platform / outlet", "What to do", "Link", "Priority", "Status", "Done on", "Notes"]
rows = [(i + 1, *r, "Not listed", None, None) for i, r in enumerate(lst)]
last_lst = sheet_table(ws, headers, rows, [5, 22, 38, 70, 48, 10, 16, 12, 30], status_col=7, status_list=STATUS_LIST, link_cols=(5,), input_cols=(7, 8, 9))
for r in range(5, last_lst + 1): ws.cell(row=r, column=8).number_format = "dd-mmm-yyyy"

# ------------------------------------------------------------------ Hashtags
ws = wb.create_sheet("Instagram Hashtags")
title(ws, "Instagram hashtags & local reach ideas", "Use 8–15 relevant hashtags per post; mix local + niche. Add location tag 'Financial District, Hyderabad'.")
tags = [
 ("Local – city", "#hyderabad #hyderabadi #hyderabaddiaries #hyderabadevents #thingstodoinhyderabad #hyderabadweekend"),
 ("Local – area", "#gachibowli #financialdistrict #kokapet #narsingi #kondapur #jubileehills #hitechcity"),
 ("Workshops", "#hyderabadworkshops #diyworkshop #craftworkshop #weekendworkshop #artworkshop #handmadewithlove"),
 ("Christmas / advent", "#adventcalendar #diyadventcalendar #christmasinhyderabad #christmascrafts #christmasworkshop #christmas2026"),
 ("Audience", "#hyderabadmoms #kidsactivitieshyderabad #kittyparty #kittypartyhyderabad #girlsnightout #familytime"),
 ("Cafés", "#hyderabadcafes #cafehopping #hyderabadfoodies #cafesofhyderabad"),
 ("Brand", "#sundarlyshmemories #createcraftcelebrate"),
 ("", ""),
 ("Reach ideas", "• Tag the venue and ask them to Collab-post the reel (both audiences see it).\n• Comment helpfully on posts by Hyderabad event pages and moms' pages (no spam links).\n• Ask 2–3 local micro-creators (5k–30k followers) to attend free in exchange for a reel.\n• Run the ₹1,000 Meta ad on the best-performing reel, 10 km around Financial District.\n• Use Instagram Broadcast Channel + Stories countdown sticker for the 29 Nov date."),
]
r = 4
for k, v in tags:
    ws.cell(row=r, column=1, value=k).font = Font(name=F, bold=True, size=10, color=PLUM)
    c = ws.cell(row=r, column=2, value=v); c.font = BODY; c.alignment = WRAP
    r += 1
ws.row_dimensions[r - 1].height = 110
ws.column_dimensions["A"].width = 22; ws.column_dimensions["B"].width = 110

# ------------------------------------------------------------------ Customer leads (opt-in)
ws = wb.create_sheet("Customer Leads (opt-in)")
title(ws, "Customer leads – people who contacted / registered (opt-in only)", "Add a row for every enquiry. Yellow = editable. Row 5 is an EXAMPLE – overwrite or delete it.")
headers = ["Date", "Name", "WhatsApp number", "Email", "Source", "Interested in", "Seats", "Consent to WhatsApp updates", "Status", "Follow-up date", "Notes"]
example = [("2026-11-19", "Example: Priya S.", "98XXXXXXXX", "priya@example.com", "Flyer QR", "Advent Calendar Workshop 29 Nov", 2, "Yes", "Follow up", "2026-11-21", "Asked if kids can join – yes")]
last_cust = sheet_table(ws, headers, example, [12, 22, 18, 26, 18, 30, 8, 16, 14, 14, 34], status_col=9, status_list=STATUS_CUST, input_cols=tuple(range(1, 12)))
ws.cell(row=5, column=2).font = Font(name=F, size=10, italic=True, color="7C6661")
for col, opts in ((5, ["Instagram DM", "Flyer QR", "Landing page", "Community post", "Referral", "Café walk-in", "WhatsApp", "Other"]),
                  (6, ["Advent Calendar Workshop 29 Nov", "Ubtan Bar", "Mehendi & Glitter Bar", "Decoden Bar", "Sand Candle", "Bedazzle", "3D Art", "Cake & Paint", "Kitty party", "Wedding planning", "Corporate", "Other"]),
                  (8, ["Yes", "No"])):
    dv = DataValidation(type="list", formula1='"' + ",".join(opts) + '"', allow_blank=True); ws.add_data_validation(dv)
    L = get_column_letter(col); dv.add(f"{L}5:{L}600")
for r in range(5, 600):
    ws.cell(row=r, column=1).number_format = "dd-mmm-yyyy"; ws.cell(row=r, column=10).number_format = "dd-mmm-yyyy"
from datetime import date
ws["A5"] = date(2026, 11, 19); ws["J5"] = date(2026, 11, 21)
ws.auto_filter.ref = "A4:K600"

# ------------------------------------------------------------------ Dashboard
ws = wb.create_sheet("Dashboard", 1)
title(ws, "Dashboard", "All numbers below are formulas – they update when you change the Status columns in each sheet.")
def block(r0, label, sheet, rng_status, statuses, extra=None):
    ws.cell(row=r0, column=1, value=label).font = SUB
    ws.cell(row=r0 + 1, column=1, value="Status").font = HFONT; ws.cell(row=r0 + 1, column=1).fill = HFILL
    ws.cell(row=r0 + 1, column=2, value="Count").font = HFONT; ws.cell(row=r0 + 1, column=2).fill = HFILL
    for i, s in enumerate(statuses):
        rr = r0 + 2 + i
        ws.cell(row=rr, column=1, value=s).font = BODY
        c = ws.cell(row=rr, column=2, value=f"=COUNTIF('{sheet}'!{rng_status},A{rr})"); c.font = BODY; c.number_format = "0"
    tr = r0 + 2 + len(statuses)
    ws.cell(row=tr, column=1, value="Total").font = Font(name=F, bold=True, size=10)
    c = ws.cell(row=tr, column=2, value=f"=SUM(B{r0 + 2}:B{tr - 1})"); c.font = Font(name=F, bold=True, size=10)
    return tr + 2
nr = block(4, "B2B leads by status", "B2B Leads", f"I5:I{last_b2b + 200}", STATUS_B2B)
nr = block(nr, "Communities by status", "Online Communities", f"I5:I{last_comm + 200}", STATUS_COMM)
nr = block(nr, "Listings by status", "Listing & Media", f"G5:G{last_lst + 200}", STATUS_LIST)
nr = block(nr, "Customer leads by status", "Customer Leads (opt-in)", "I5:I600", STATUS_CUST)
ws.cell(row=nr, column=1, value="Seats booked or paid").font = Font(name=F, bold=True, size=10)
c = ws.cell(row=nr, column=2, value="=SUMIFS('Customer Leads (opt-in)'!G5:G600,'Customer Leads (opt-in)'!I5:I600,\"Booked\")+SUMIFS('Customer Leads (opt-in)'!G5:G600,'Customer Leads (opt-in)'!I5:I600,\"Paid\")")
c.font = Font(name=F, bold=True, size=10)
# B2B by category (high priority)
ws.cell(row=4, column=4, value="B2B leads by category").font = SUB
ws.cell(row=5, column=4, value="Category").font = HFONT; ws.cell(row=5, column=4).fill = HFILL
ws.cell(row=5, column=5, value="Leads").font = HFONT; ws.cell(row=5, column=5).fill = HFILL
ws.cell(row=5, column=6, value="High priority").font = HFONT; ws.cell(row=5, column=6).fill = HFILL
cats = sorted({r[0] for r in b2b})
for i, cat in enumerate(cats):
    rr = 6 + i
    ws.cell(row=rr, column=4, value=cat).font = BODY
    ws.cell(row=rr, column=5, value=f"=COUNTIF('B2B Leads'!B5:B{last_b2b + 200},D{rr})").font = BODY
    ws.cell(row=rr, column=6, value=f"=COUNTIFS('B2B Leads'!B5:B{last_b2b + 200},D{rr},'B2B Leads'!G5:G{last_b2b + 200},\"High\")").font = BODY
ws.column_dimensions["A"].width = 30; ws.column_dimensions["B"].width = 10; ws.column_dimensions["C"].width = 4
ws.column_dimensions["D"].width = 34; ws.column_dimensions["E"].width = 10; ws.column_dimensions["F"].width = 14

for s in wb.worksheets:
    s.sheet_properties.tabColor = GOLD if s.title in ("Read Me", "Dashboard") else PLUM
wb.save(OUT)
print("saved", OUT, "b2b", len(b2b), "communities", len(comm), "listings", len(lst))
