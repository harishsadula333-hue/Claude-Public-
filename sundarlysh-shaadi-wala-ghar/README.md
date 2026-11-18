# Sundarlysh Memories – "Shaadi Wala Ghar" home décor reel

Made from Sundarlysh's own photos and clips of a wedding-home décor setup.

- `sundarlysh_shaadi_wala_ghar.mp4`: 1080×1920, 30 fps, 47 s, with music (for Instagram Reels, Stories and WhatsApp)
- `sundarlysh_shaadi_wala_ghar_no_music.mp4`: the same edit with no audio, so you can add a trending song inside Instagram

## Flow (every cut lands on the beat, 97 bpm)
| Time | Shot | Caption |
|---|---|---|
| 0–3.7 s | Floral close-up with fairy lights, tilting to the sign | *Shaadi wala ghar?* LET'S MAKE IT **LOOK LIKE ONE** |
| 3.7–8.7 s | Door-arch photo, zoom into the "शादी वाला घर" sign | The welcome · **Floral Entrance Arch** |
| 8.7–10.5 s | Door opens into the decorated living room | Shaadi wala ghar · **Step Inside** |
| 10.5–20.4 s | Ceiling hangings, carved partition, ceiling photo | Living room · **Ceiling Florals & Hangings** |
| 20.4–22.9 s | Dining-table flower vase | Every corner · **Dining Table Florals** |
| 22.9–32.2 s | Doorway photo, garlanded doors, marigold close-up | Traditional touch · **Marigold Door Garlands** |
| 32.2–34.6 s | Balcony with drapes and hanging florals | Outdoors too · **Balcony Décor** |
| 34.6–42.1 s | Mandir clips and photo | The sacred space · **Pooja Mandir Décor** |
| 42.1–47 s | Wine end card with logo | *Your home, dressed for the celebration* · Haldi · Mehendi · Wedding functions · **DM TO BOOK** · @sundarlyshmemories · Bengaluru · Hyderabad |

Footage has a light colour polish (warmer, richer colours). Clips are slowed slightly (0.8–0.9×) for a smoother, more premium feel. Moments with a family member's face in frame are left out.

## Music credit (required if you post the version with music, add to the caption)
> Music: "Vadodora" by Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/

## Re-editing
`shot_list.json` lists every shot (clip, in-point, length, caption). Edit it and re-run:

    python3 home_reel.py shot_list.json out.mp4

Point `src`, `music`, `fonts` and `logo` at your local files. This needs Python 3 with Pillow and NumPy, plus ffmpeg.
