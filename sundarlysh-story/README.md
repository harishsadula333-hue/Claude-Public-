# Sundarlysh Events – "Why couples choose us" story reel

`sundarlysh_why_choose_us.mp4`: 1080x1920 vertical, 30 fps, 43.5 s, made for Instagram Reels.

## Story

| Time | Beat | On-screen text |
|---|---|---|
| 0–6 s | Hook (couples) | *Every love story… deserves a* BEAUTIFUL BEGINNING |
| 6–12 s | Problem (planning-stress montage, cut on the beat) | *But planning it?* VENUES. VENDORS. GUESTS. BUDGETS. → *It can feel* OVERWHELMING. |
| 12–15 s | Turn (logo reveal) | *That's where* WE COME IN |
| 15–37.5 s | Why couples choose Sundarlysh | 01 Personalised Planning · 02 Breathtaking Décor · 03 Trusted Vendors · 04 Seamless Execution · 05 Local Expertise (trusted venues & teams across Bengaluru & Hyderabad) |
| 37.5–40.5 s | Payoff | *You live every moment.* WE TAKE CARE OF THE REST |
| 40.5–43.5 s | Call to action | Logo · *Care with Style* · Wedding Planning · Décor · Bengaluru & Hyderabad · DM US TO PLAN YOUR DREAM WEDDING · @sundarlyshevents |

Locations: **Bengaluru and Hyderabad only.**

## People in the video are AI-generated

Every shot showing a person (the six couple shots and the two "stressed planner" shots) is an AI-generated image. No real person's face appears. The AI images are in `ai-images/`.

- Made locally with Stable Diffusion XL base 1.0 + SDXL-Lightning 4-step (both CreativeML Open RAIL++-M, which allows commercial use) using `generate_ai_images.py`.
- **When posting on Instagram, turn on the "AI info" label** (Advanced settings → "Add AI label"). Meta expects realistic AI imagery to be labelled, and labelling it keeps things transparent.

The other shots (décor, venues, food, invitations) are free Pexels stock photos with no people in them.

## Music credit (required, add to the caption)

> Music: "Canon in D Major" by Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/

## Re-rendering / swapping photos

Each shot in `SHOTS` in `story.py` names a photo by file stem (e.g. `ai_hook1`, `34079355`). Put a file with that name in the photo folder, or edit the stem, then:

    python3 story.py <photo_dir> <logo.jpg> <fonts_dir> canon.mp3 out.mp4
    python3 story.py ... <preview_dir> --preview 2,10,20   # stills only

Fonts (Google Fonts, OFL): Great Vibes, Italiana, Cormorant Garamond (+ Italic), Montserrat. Needs Python 3 with Pillow and NumPy, plus ffmpeg.

## Photo credits

Décor photos from [Pexels](https://www.pexels.com/license/) (free for commercial use; attribution not required):

- https://www.pexels.com/photo/19905189/
- https://www.pexels.com/photo/28845664/
- https://www.pexels.com/photo/31307957/
- https://www.pexels.com/photo/34079355/
- https://www.pexels.com/photo/17023110/
- https://www.pexels.com/photo/12024173/
- https://www.pexels.com/photo/29703684/
- https://www.pexels.com/photo/28976228/
- https://www.pexels.com/photo/7162699/
- https://www.pexels.com/photo/5038739/
- https://www.pexels.com/photo/33485973/
- https://www.pexels.com/photo/38302968/
- https://www.pexels.com/photo/39797460/
- https://www.pexels.com/photo/48000/
