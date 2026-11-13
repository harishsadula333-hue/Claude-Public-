# AIMS 50-second promo video — source

Rendered output: `../AIMS_Promo_50s_1080p_v2.mp4` (latest; v1 = `../AIMS_Promo_50s_1080p.mp4`) (1920×1080, 30 fps, H.264 + AAC, 50 s).
All photos, course details, awards, placements and contact details come from the AIMS brochure PDF,
plus client feedback (v2): PGDHM 18 months, Indian & Tandoori cuisines, Sir C.V. Raman Academy award,
director award photo, "Admissions Open" and the "Join AIMS… AIM your Dreams…" tagline.

## Storyboard
| Time | Scene |
|---|---|
| 0–4 s | Logo reveal · "Choose AIMS… Chase Dreams…" · Admissions Open |
| 4–9.5 s | "A Premier College to Study Hotel Management in Hyderabad" — since 2011, OU, 20:1 ratio, 3 kitchen labs |
| 9.5–19.5 s | Courses — BHM&CT (3 yrs), DHM (18 m), ADHM (18 m), PGDHM (18 m) with eligibility |
| 19.5–28.5 s | Training labs — Restaurant & Bar, Front Office, Housekeeping, 3 Kitchens, Bakery |
| 28.5–33.5 s | Why AIMS — 6 highlights + campus-life photo mosaic |
| 33.5–39 s | Awards — Sir C.V. Raman Academy (featured), 2017, 2018, 2019, 2022 + cricket runner-up |
| 39–45 s | Placements — student photos, destinations, hotel brands, careers |
| 45–50 s | Director with 2022 award · Admissions Open · Scholarships · phone, website, address |

## Edit & re-render
Text lives in `index.html` (scene markup plus the `LABS`, `WHY`, `AW`, `DESTS` arrays).
Preview any moment: open `index.html?t=12` in a browser (or `?play` to play it live).

```bash
cd aims-promo-video
python3 tools/music.py music.wav 50          # original synthesized music (royalty-free)
node tools/capture.js index.html - 30 | ffmpeg -y -f image2pipe -framerate 30 -c:v mjpeg -i - \
  -i music.wav -map 0:v -map 1:a -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k \
  -movflags +faststart -shortest ../AIMS_Promo_50s_1080p_v2.mp4
```
Needs Node + Playwright (Chromium), Python 3 + NumPy, and ffmpeg.
