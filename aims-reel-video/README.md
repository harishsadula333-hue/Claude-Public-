# AIMS "Hotel Management is EASY!" — 40 s Instagram Reel

Rendered output: `../AIMS_Reel_40s_vertical.mp4` (1080×1920, 30 fps, H.264 + AAC).
Concept follows the client's "Hotel Management is Easy" poster; photos are real AIMS brochure photos
(shared with `../aims-promo-video/img`, linked as `img/`).

| Time | Scene |
|---|---|
| 0–4 s | Hook: HOTEL MANAGEMENT IS EASY! |
| 4–10 s | Because it's simple — 5 reasons checklist |
| 10–14 s | LEARN → PRACTICE → WORK → EARN (fast cuts) |
| 14–21 s | Courses offered: BHMCT, DHM, ADHM, PGDHM |
| 21–26 s | Your future with AIMS — 5 benefits |
| 26–31 s | Global career begins here — flight route, placed students |
| 31–35 s | Meet celebrities • Serve the best • Big events — photo grid |
| 35–40 s | Join AIMS… To AIM your DREAMS — admissions, phone, website |

Re-render:
```bash
cd aims-reel-video
CUTS=4,10,14,21,26,31 HITS=11,12,13 python3 ../aims-promo-video/tools/music.py music.wav 40
W=1080 H=1920 node ../aims-promo-video/tools/capture.js index.html - 30 | ffmpeg -y -f image2pipe -framerate 30 \
  -c:v mjpeg -i - -i music.wav -map 0:v -map 1:a -c:v libx264 -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k \
  -movflags +faststart -shortest ../AIMS_Reel_40s_vertical.mp4
```
