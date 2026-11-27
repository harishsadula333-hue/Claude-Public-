# How Do Dreams Happen? 3D reel (Telugu, ~64 s)

**Final video:** `output/dreams-telugu.mp4` (1080×1920, 30 fps)

## Facts covered
All are mainstream sleep science, simplified:
- Sleep runs in roughly 90-minute cycles, with REM (rapid eye movement) sleep at the end of each cycle. The most vivid dreams happen in REM, and REM periods get longer toward morning.
- In REM the amygdala (emotions) and visual areas are highly active, while the prefrontal cortex (logic) quiets down. That's why strange dreams feel real.
- The hippocampus replays memories, mixing old ones with the day's events into a story.
- The brainstem temporarily blocks muscle movement (REM atonia), while the eyes and breathing keep working.
- We dream about 2 hours a night and forget most dreams within minutes of waking.
- People born blind dream in sounds, touch and smells rather than images.

## How it's made
- **3D:** three.js scenes rendered frame by frame in headless Chromium (`src/scene.js`): a dream world with floating islands, a moonlit bedroom with a breathing sleeper and REM eye movement, a procedural see-through brain with glowing regions, memory cards merging into a dream bubble, and an X-ray view of the body lock.
- **Voice:** Gemini TTS (voice *Achird*) in one take. Caption timings come from DTW alignment (a sound-by-sound match against a reference reading of the same text).
- **Audio:** original synthesized dreamy music and effects.
- Same toolchain as `metro-qr-reel/`.
