# Sundarlysh Memories – teasers & caricature video (from the 18 Nov meeting)

All files are 1080×1920 vertical, made for Reels, Stories and WhatsApp status. **Drafts: post only after Prachi approves.**

| File | Length | What it is |
|---|---|---|
| `Sundarlysh_Memories_Christmas_Workshop_Teaser.mp4` | 23 s | Short version of the advent reel: 24 hook → title + FIRST TIME EVER → "One surprise a day" → date card → DM to book |
| `Sundarlysh_Memories_Advent_Caricature.mp4` | 37 s | 3D caricature short: Riya & Meera speech-bubble chat ("What are you doing this weekend?" … "Ever made your own advent calendar?") → making, families, opening daily → details card → "See you there!" → DM to book |
| `Sundarlysh_Memories_Workshops_Teaser.mp4` | 28 s | General workshops: Ubtan bar, Kundan mehendi, Glitter, Decoden, Bedazzle, Sand candles, Cake & paint, 3D art, Tree lighting → "for kitty parties, cafés, birthdays, celebrations" |
| `wedding/Sundarlysh_Memories_Wedding_Teaser.mp4` | 28 s | Combined wedding teaser: "Planning a wedding? Leave everything to family" → budget-friendly décor (real footage) · anchors & artists · event management · guest workshops · food · photography · invites · special effects · choreography · mehendi → "Your one-stop family event planners. Not just a business, family." |
| `wedding/Sundarlysh_Memories_Wedding_outfit.mp4` | 14 s | "Which outfit to choose?" |
| `wedding/Sundarlysh_Memories_Wedding_varmala.mp4` | 14 s | "Which varmala to choose?" |
| `wedding/Sundarlysh_Memories_Wedding_special_effects.mp4` | 14 s | Cold pyro, fog & confetti |
| `wedding/Sundarlysh_Memories_Wedding_bride_family.mp4` | 14 s | Make the bride's family feel special |
| `wedding/Sundarlysh_Memories_Wedding_groom_family.mp4` | 14 s | Make the groom's family feel special |

Notes:
- People and scenes are AI-generated (except the floral-arch clip in the wedding teaser, which is Sundarlysh's own footage). Turn on Instagram's **AI info** label. Swap in real wedding photos when Prachi sends them on Friday, using the same file names in `wedding-images/`.
- The realistic "AI face + Prachi's voice" video needs her voice recording first. The script is in `../sundarlysh-marketing-kit/README.md` (section 4).

## Music credits (add the one used to the caption)
All by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/
- Christmas teaser: "We Wish You a Merry Christmas"
- Caricature video: "Christmas Rap"
- Workshops teaser: "Life of Riley"
- Wedding teasers: "Vadodora"

## Re-render
`teaser.py <spec.json> out.mp4`. Each `.json` lists the shots, captions and beat lengths. Edit the text there.

## "Something magical is coming to Hyderabad" (20 s)
`Sundarlysh_Memories_Something_Magical_Teaser.mp4` is a 1080×1920, 30 fps teaser for the Advent Calendar Workshop that keeps the workshop a mystery until the reveal. It was rendered with `magic_teaser.py`.

| Time | What's on screen |
|---|---|
| 0–6 s | Dark, glowing gold dust. "Something magical…", then "is coming to", then **HYDERABAD** |
| 6–12 s | A beat-cut countdown 24 → 1 over workshop moments, with a flash and tick on every beat |
| 12–16 s | An impact and a gold burst reveal **FIRST TIME EVER IN HYDERABAD · The Christmas ADVENT CALENDAR WORKSHOP** |
| 16–18 s | Save the date: Sunday 29 November, Van Lavino Café & Patisserie, Financial District |
| 18–20 s | Logo, COMING SOON, Stay tuned, @sundarlyshmemories |

Sound: the music plus synthesised impacts, a riser and a chime shimmer, loudness-normalised to -14 LUFS. The price is left out on purpose for a teaser.
Music: "Wish Background" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0. The credit goes in the caption.

### Energetic beat version (recommended)
`Sundarlysh_Memories_Something_Magical_Teaser_BEATS.mp4` uses the same visuals with an **original Christmas EDM track** (`magic_beat.py`, 120 bpm). Every kick lands on a cut. The video adds a zoom and brightness pulse on each kick, a golden glow pulse on the cards, and camera shake on the big hits. It was rendered with `magic_teaser2.py out.mp4 beat.wav`.

| Time | Music |
|---|---|
| 0–4 s | Heartbeat kick, magical bell arpeggios, sleigh bells, dark pad |
| 4–6 s | Hit on "FIRST TIME EVER IN", then "HYDERABAD" on the next kick, then a snare roll, a riser, ¼ s of silence and the **DROP** |
| 6–11 s | Full beat: kick, 808 bass, claps, hats, pumping supersaw, and a "Jingle Bells" bell lead on the countdown |
| 11–12 s | Second build |
| 12–19 s | **Big drop** on the reveal, with a "hey!" hit at 13.5 s |
| 19–20 s | Final hit with the logo, then a sparkle tail |

The music is original and written for this video, so no credit is needed. The "Jingle Bells" melody is public domain. Loudness is -12 LUFS.

## "ARE YOU READY?" kinetic-type teaser (20 s)
`Sundarlysh_Memories_Are_You_Ready_Teaser.mp4` is in the style of trending "coming soon" reels. Words cut on every beat over black, cream and red, followed by a burst of workshop photos and a "COMING SOON / STAY TUNED" ending. It was rendered with `kinetic_teaser2.py out.mp4 hitman_mix.wav`.

| Time | On screen | Music |
|---|---|---|
| 0–4.4 s | SUNDARLYSH MEMORIES PRESENTS · ARE · YOU · READY? (glitch, echo) · SOMETHING · MAGICAL · IS · COMING · TO | Tense breakdown, with a hit and whoosh on every word |
| 4.4–6.8 s | **HYDERABAD** zooms through the screen, then FIRST TIME EVER IN HYDERABAD, then photo flashes with light-leak wipes | Brass hit + crash, then the beat comes in |
| 6.8–9.6 s | CHRISTMAS echo · 24 · SURPRISES · MADE · BY · YOU | The track's break, snare roll and riser |
| 9.6–14.4 s | **Drop**: photo cuts every half-beat · THE CHRISTMAS · ADVENT CALENDAR · WORKSHOP · 29.11.2026 · DON'T MISS · SUNDAY 5–7 PM · VAN LAVINO CAFÉ, FINANCIAL DISTRICT | Full beat comes back in |
| 14.4–17.6 s | COMING SOON + STAY TUNED tape banners | Full beat |
| 17.6–20.2 s | STAY is typed out · TUNED fills red · logo · @sundarlyshmemories | Music muffles, then a final hit |

**Music:** "Hitman" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0. It is re-edited on its beat grid with `hype_mix.py`: the breakdown, then bars 5–13 with the re-entry on the drop. Sound effects (whooshes, hits, glitches, snare roll, riser, typewriter clicks) are synthesised and synced to the cuts. Font: Anton (SIL OFL).
**Credit for the caption:** Music: "Hitman" by Kevin MacLeod (incompetech.com), CC BY 4.0
An earlier version with Christmas trap music can be rebuilt with `kinetic_teaser.py` + `carol_beat.py`.

### v3: client changes from the 19 Nov meeting (use this one)
`Sundarlysh_Memories_Are_You_Ready_Teaser_v3.mp4` (`kinetic_teaser3.py out.mp4 hitman_mix.wav`) has Christmas red, green and white backgrounds with snow and confetti, and no black. "WONDERFUL" replaces "MAGICAL". The plain Christmas cake replaces the cake-painting photo, and only advent and Christmas photos are used. *Advent Calendar* is set in a script font, the venue in Playfair italic and the date in Cinzel. The elements copied from the sample videos are replaced with festive effects. The script with timings for the client's review is in `Teaser_Script_for_Review.md`.
`Sundarlysh_Memories_Something_Wonderful_Teaser_BEATS.mp4` is the gold teaser with "Something wonderful…" (it replaces the "magical" versions, which should no longer be used).
