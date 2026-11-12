# Sundarlysh Events – "Activities in action" reel

`sundarlysh_activities_live.mp4`: 1080x1920 vertical, 30 fps, 50.7 s, made for Instagram Reels. It shows people actually doing the activities: hands at work, friends laughing, finished pieces shown off. Every cut is on the beat of "Happy Alley" (111.5 bpm).

| Time | Scene |
|---|---|
| 0–4.4 s | Hook (soft intro): friends laughing at a styled party table. *Kitty party…* then on the second chime **…but make it CREATIVE** |
| 4.4–6.6 s | The groove kicks in on the set-up reveal: *we bring the kits, the décor & the fun* |
| 6.6–41 s | 8 activities, 2 moving clips each (the action, then the reaction or show-off): **Mehendi & Glitter Bar** · **The Ubtan Bar** · **Decoden Frosting Bar** · **Bedazzle Workshop** · **Sand Candle Making** · **Cake & Paint** · **3D Art Workshop** (perfect for cafés) · **Christmas Specials** (pipe-cleaner trees & glowing mini canvases) |
| 41–45.3 s | Group shot with their creations: *everyone goes home with something they made* |
| 45.3–50.7 s | CTA: *your next get-together,* **SORTED.** · Kitty parties / Cafés / Celebrations / Christmas · DM US TO BOOK · @sundarlyshevents · Bengaluru · Hyderabad |

Style: Instagram-style sticker captions that pop in on the beat, a white flash on each new activity, and light film grain.

## How it was made (all original, nothing taken from the reference reels)
1. **Stills:** 19 scenes generated with SDXL base 1.0 + SDXL-Lightning (`generate_stills.py`, `still_prompts.json`), two options each, best picked → `ai-stills/`.
2. **Motion:** each still animated into a ~2 s clip with **LTX-Video 2B distilled 0.9.8** image-to-video (`ltx_animate.py`, `motion_prompts.json`) → `ai-clips/`.
3. **Edit:** `live.py` retimes the clips with motion interpolation to fill each beat-length scene, adds the stickers, transitions, grain and CTA, and mixes the music.

## Before posting
- **All people are AI-generated. Turn on Instagram's "AI info" label.**
- **Music credit (required, add to the caption):**
  > Music: "Happy Alley" by Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/
- **Model licences:**
  - SDXL / SDXL-Lightning: CreativeML Open RAIL++-M, which allows commercial use.
  - LTX-Video: LTXV Open Weights License, which allows commercial use for businesses under US$10M annual revenue, subject to its use restrictions.
- **"Kitty parties" appears on screen.** Confirm with Sundarlysh that they offer kitty party bookings.

## Re-render
    python3 live.py ai-clips ai-stills <logo.jpg> <fonts_dir> Happy_Alley.mp3 out.mp4
    python3 live.py ... <preview_dir> --preview 2,10,20
Captions are in the `ACTS` list at the top of `live.py`. If a clip is removed from `ai-clips/`, that scene falls back to its still with a slow push-in.
