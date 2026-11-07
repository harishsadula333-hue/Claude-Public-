# Sundarlysh Workshop — "Coming Soon" Reel

`sundarlysh_workshop_teaser.mp4` — 18 s, 1080×1920 (9:16), 30 fps, H.264 + AAC. Ready to upload as an Instagram Reel.
`cover.jpg` — use it as the reel cover.

## Beat map (120 BPM, every cut lands on the beat)
| Time | Visual | Sound |
|---|---|---|
| 0–1 s | "SOMETHING" decodes, REC/HUD frame | heartbeat + hit |
| 1–2 s | **BIG** slams in gold | heartbeat + hit |
| 2–3 s | "IS COMING" letter-by-letter | clock ticks, riser starts |
| 3–4 s | GET → READY zoom, speed lines, white-out | snare roll, reverse cymbal, ½-beat silence |
| 4 s | **DROP**: logo bursts in with shockwave + sparks | impact + 808 groove |
| 4–8 s | SUNDARLYSH / EVENTS / PRESENTS | groove |
| 8–12 s | GET READY · FOR · THE · WORKSHOP · LEARN/CREATE/CONNECT/SHINE | harder groove + stabs |
| 12–14 s | ARE YOU READY? → 3 · 2 · 1 | braams, riser, silence |
| 14 s | **DROP 2**: end card — logo, WORKSHOP, COMING SOON, @sundarlyshevents | full beat |
| 17 s | final impact, ring-out | |

## Logo
`logo.jpg` is the Sundarlysh Events logo; it is cropped into the rose-gold circular badge automatically.
Replace it (logo.png / logo.jpg) and run `./build.sh` to change it.

## Change the words
Edit the `COPY` block at the top of `reel.html` (brand, handle, the four words, tagline), then `./build.sh`.

Requires python3 + numpy, node + playwright (Chromium), ffmpeg. The music (beat, piano-pluck hook with echo, music-box bells, sparkle shimmers, silk swooshes, countdown beeps, typing clicks, notification ding) is synthesised from scratch in `audio.py` (no samples, no copyright issues).
