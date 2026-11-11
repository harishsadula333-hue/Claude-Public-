# Sundarlysh Events – Experience Bars & Workshops promo

`sundarlysh_experiences.mp4`: 1080x1920 vertical, 30 fps, 41 s, made for Instagram Reels.

## Structure (every cut lands on the music's beat)

| Time | Section |
|---|---|
| 0–4.7 s | Hook: fast montage. *Your guests deserve* MORE THAN A PARTY. *they deserve an* EXPERIENCE |
| 4.7–7.1 s | Logo: *presents* EXPERIENCE BARS & WORKSHOPS |
| 7.1–17.1 s | **For Weddings & Parties**: The Ubtan Bar · Kundan Mehendi Art · Freckles & Glitter Bar |
| 17.1–27.6 s | **Workshops for All Ages**: Sand Candle Making · Bedazzle Workshops · 3D Art Workshops (for cafés) · Decoden Frosting Bar |
| 27.6–37 s | **Christmas Specials** (music switches to Jingle Bells, snow falls): Cake & Paint · Mini Canvas Tree Lighting · Pipe-Cleaner Christmas Trees |
| 37–41 s | CTA: *Bring the magic to your celebration* · Weddings / Parties / Cafés / Christmas · DM US TO BOOK · @sundarlyshevents · Bengaluru · Hyderabad |

Each activity card shows its audience tag: Weddings & Parties, For the Ladies, All Ages, For Cafés, or Christmas Exclusive.

## All images are AI-generated

No real people or stock photos are used. All 18 images were generated locally with Stable Diffusion XL base 1.0 + SDXL-Lightning (CreativeML Open RAIL++-M, which allows commercial use) using `gen_acts.py` and `acts_prompts.json`. The images are in `ai-images/` (`h_*` are the hook-montage alternates).

**When posting, turn on Instagram's "AI info" label** (Advanced settings → Add AI label).

## Music credit (required, add to the caption)

> Music: "Life of Riley" and "Jingle Bells" by Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/

## Re-rendering

    python3 promo.py <img_dir> <logo.jpg> <fonts_dir> Life_of_Riley.mp3 Jingle_Bells.mp3 out.mp4
    python3 promo.py ... <preview_dir> --preview 2,10,20   # stills only

Edit titles, taglines and tags in the `card(...)` lines of `promo.py`. To use real photos from Sundarlysh's own events, save them over the matching file name in the image folder. Fonts: Montserrat, Great Vibes, Cormorant Garamond Italic (Google Fonts, OFL).
