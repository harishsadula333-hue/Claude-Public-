# Telugu reel: animated graphics + natural Gemini voice (50 s)

**Final video (v3):** `output/file-delete-telugu-reel-v3.mp4` (1080×1920, 30 fps, H.264 + AAC, -14 LUFS)
**Cover:** `output/cover-v3.jpg`

## v3: human-edited look and sound
- Removed the voice-waveform animation and the top progress bar.
- **Visuals:** calmer dark background with subtle film grain (no binary rain or dot grid), and slight handheld camera motion with editor-style punch-in zooms on key words. Yellow sticker-style section labels with a small tilt. Bold outlined captions with no box, hard-cut line to line.
- **Hand-drawn marker doodles** draw on screen with a marker sound at key moments: an arrow from the Address List to the blocks, a circle around "data still here" and around "Recovered!", and underlines under "దాదాపు అసాధ్యం" and the auto-delete warning.
- **Audio:**
  - A faint room-tone bed and small-room acoustics on the voice, so there are no dead digital silences.
  - Music with natural timing and swing, varied note strength, warm tape saturation and a light vinyl texture.
  - The voice sits about 13 dB above the music during speech.

## Voice (from v2)
Google Gemini TTS (`gemini-3.8-flash-tts`, male voice *Achird*), generated as one take from a director-style prompt. Caption word timings come from aligning the voice with a reference reading of the same text (MFCC dynamic time warping, a sound-by-sound match), with sentence starts snapped to pauses.

Gemini audio carries Google's SynthID watermark. It is left intact. When posting on Instagram, add the "AI info" label for the AI voice as Meta's policy asks.

Rebuild: `GEMINI_KEY_FILE=/path/to/key.txt tools/make.sh` (writes the reel to `output/`). Never commit the key.
