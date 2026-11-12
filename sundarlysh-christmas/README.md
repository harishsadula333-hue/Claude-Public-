# Sundarlysh Events – Christmas Workshops reel

`sundarlysh_christmas.mp4`: 1080x1920 vertical, 30 fps, 35 s, made for Instagram Reels. Every cut lands on the beat of Jingle Bells (90 bpm).

| Time | Scene |
|---|---|
| 0–5.3 s | Hook: cozy craft table with snowfall. *This Christmas, don't just celebrate…* **CREATE** *something magical*, with beat-cut reveals of the finished pieces |
| 5.3–7.3 s | Logo badge: *presents* **CHRISTMAS WORKSHOPS** · *fun, festive & for all ages* |
| 7.3–15.3 s | **01 Cake & Paint** (All ages): start with a blank cake → paint with edible colours → add a little sparkle → a masterpiece you can eat! |
| 15.3–23.3 s | **02 Mini Canvas Tree Lighting** (Christmas exclusive): set up your mini canvas → paint your tree → add the fairy lights → *and… lights on!* (dark-to-glow reveal) |
| 23.3–31.3 s | **03 Pipe-Cleaner Christmas Trees** (Christmas exclusive): grab some pipe cleaners → twist & shape → add pom-poms & a star → your very own tree! |
| 31.3–35.3 s | CTA: *Christmas only* · BOOK YOUR SESSION · All ages / Families / Kids / Friends · DM US TO BOOK · @sundarlyshevents · Bengaluru · Hyderabad |

Each activity opens with a red-and-gold ornament iris wipe showing its number. Step captions change on every shot, with progress dots, and there are sparkle bursts on each finished reveal.

## Images are AI-generated
All 18 images were generated locally with SDXL base 1.0 + SDXL-Lightning (CreativeML Open RAIL++-M, which allows commercial use). The prompts are in `xmas_prompts.json` and the images in `ai-images/`. **Turn on Instagram's "AI info" label when posting.**

## Music credit (required, add to the caption)
> Music: "Jingle Bells" by Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/

## Re-render
    python3 xmas.py <img_dir> <logo.jpg> <fonts_dir> Jingle_Bells.mp3 out.mp4
    python3 xmas.py ... <preview_dir> --preview 2,10,20
Text lives in the `ACTS` list at the top of `xmas.py`.
