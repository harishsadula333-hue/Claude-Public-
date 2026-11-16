# How Hyderabad Metro QR Tickets & Gates Work: 3D reel (Telugu, ~101 s)

**Final video:** `output/metro-qr-gates-telugu.mp4` (1080×1920, 30 fps)

The video answers 10 questions:
1. What's inside a QR ticket?
2. What happens when you scan at the entry gate?
3. How does a smart card talk to the scanner?
4. How does a mobile QR ticket become valid?
5. How is the fare calculated?
6. Why does the gate show a red light?
7. How do the gates open and close?
8. How does the gate know one person passed?
9. What if two people use one ticket?
10. Why scan again at exit?

## How it's made
- **3D:** three.js scene rendered frame by frame in headless Chromium (`src/scene.js`). It has an elevated platform with a city skyline and a three-car train, a concourse with flap gates (scanners, LEDs, retracting flaps, infrared beams, see-through internals), animated commuters, a phone, a smart card, a server and a 3D route map.
- **Voice:** Gemini TTS (`gemini-3.8-flash-tts`, voice *Achird*) in one take, directed to sound friendly and conversational. Caption timings come from aligning the voice with a reference reading of the same text (DTW, a sound-by-sound match).
- **Audio:** original synthesized music, station ambience (crowd murmur, air handling, a chime), and gate, train and alarm effects.
- **Accuracy:** the QR data fields shown are typical of metro QR tickets. The exact encrypted payload isn't public. Fares are shown as distance slabs, without rupee amounts, since amounts change. The metro look is generic: no official logos are used.

Rebuild: `GEMINI_KEY_FILE=… python3 src/gen_voice.py Achird && python3 src/align.py`, then render with `tools/render.js` (it starts a local server, because ES modules need http), run `python3 tools/audio.py`, and mux with ffmpeg (see the v2 make.sh). Never commit the API key.
