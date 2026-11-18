# Sundarlysh Memories – Christmas Advent Calendar Workshop reel

`Sundarlysh_Memories_Advent_Calendar_Workshop.mp4`: 1080×1920, 30 fps, 60.5 s, made for Instagram Reels, Stories and WhatsApp.

The brief comes from the 17 Nov client meeting. The workshop is on 29 Nov, 5–7 PM, at a bakery café in the Financial District, Hyderabad. There are 24 kinds of props and gifts, participants create and customise their own gift bags or goodies box (no pre-packed gifts), and it is the first event of its kind in Hyderabad. Tickets are sold first through Instagram DMs.

| Time | Scene |
|---|---|
| 0–4 s | Big gold **24** · *Days · 24 little surprises · that you make yourself* |
| 4–8 s | *What if you made every one yourself?* |
| 8–12.5 s | Logo · Sundarlysh Memories presents **The Christmas ADVENT CALENDAR WORKSHOP** |
| 12.5–29 s | 24 kinds of props & little gifts → Step 1 Pick what goes inside → Step 2 Decorate your gift bags → Step 3 …or a goodies box |
| 29–37.5 s | No pre-packed gifts. **JUST YOURS** · Perfect for **Friends · Families · Kids** |
| 37.5–45 s | *One surprise a day, all the way to Christmas* · Hyderabad's **FIRST** advent calendar workshop |
| 45–51 s | Save the date: **SUNDAY 29 NOVEMBER · 5 PM – 7 PM** · Bakery Café, Financial District, Hyderabad · One session only |
| 51–55 s | Limited seats · **BOOK ON INSTAGRAM** |
| 55–60.5 s | Logo · *Make Christmas unforgettable* · **DM TO BOOK** · @sundarlyshmemories |

Cuts land on the beat (115 bpm), with snowfall, gold sparkles and plum + gold branding.

## Before posting
- **Venue name:** the meeting notes spell the café two ways ("Van Leo Franco" / "Van Lavvenco"), so the reel says "Bakery Café". Add the confirmed name in `VENUE_L1` in `advent.py` and re-render.
- **Images are AI-generated** illustrations. Turn on Instagram's "AI info" label. Replace them with real workshop photos later by saving over the same file names in `images/`.
- **Music credit** (required, add to the caption):
  > Music: "We Wish You a Merry Christmas" by Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/

## Re-render
    python3 advent.py images logo.jpg <fonts_dir> "We Wish You.mp3" out.mp4
(This needs Python 3 with Pillow and NumPy, plus ffmpeg. Fonts: Cinzel, Pinyon Script, Montserrat, Cormorant Garamond.)
