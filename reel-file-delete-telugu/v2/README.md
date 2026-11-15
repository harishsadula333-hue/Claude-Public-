# v2: Animated graphics + natural Gemini Telugu voice (50 s)

**Final video:** `output/file-delete-telugu-reel-v2.mp4` (1080×1920, 30 fps, H.264 + AAC, -14 LUFS)
**Cover:** `output/cover-v2.jpg`

What changed from v1:
- **Voice:** Google Gemini TTS (`gemini-3.8-flash-tts`, male voice *Achird*), generated as one take for natural flow from a director-style prompt (a friendly Hyderabad tech creator, conversational Telugu, English tech words said the Telugu way). *Achird* won blind A/B comparisons against Puck, Sadaltager and Charon.
- **No avatar:** full-screen motion graphics with a slow camera drift, plus a live voice waveform under the captions.
- **Captions:** Gemini returns no timestamps, so word timings come from aligning the voice with a reference reading of the same text (MFCC dynamic time warping, a sound-by-sound match), with sentence starts snapped to pauses. 15 of 16 pauses matched before snapping.
- **Mix:** voice compression and peak limiting; music ducked about 14 dB under speech.

Script: `src/script.txt`. Rebuild: `GEMINI_KEY_FILE=/path/to/key.txt tools/make.sh`. Never commit the key.
