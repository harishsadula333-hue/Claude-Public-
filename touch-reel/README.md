# How Does a Touchscreen Know Where We Touched? 3D reel (Telugu, ~61 s)

**Final video:** `output/touch-telugu.mp4` (1080×1920, 30 fps). There is no follow-us outro.

## Facts covered
All describe projected-capacitive touchscreens, simplified:
- Under the cover glass sits a transparent grid of conductive lines (usually indium tin oxide) in rows and columns, holding a small electric field.
- The human body (water and salts) is conductive, so a finger changes the local field (capacitance) where it touches.
- A controller chip scans the grid hundreds of times a second (touch sampling), finds which rows and columns changed, and computes the touch coordinates. Each crossing is measured separately, so multi-touch (10 fingers) works.
- Ordinary plastic pens, regular gloves and fingernails are insulators, so they don't change the field. Capacitive styluses use a conductive rubber tip.
- Fun fact: in cold South Korean winters, people were reported to use sausages as conductive styluses so they could keep their gloves on.

## How it's made
- **3D:** three.js, rendered frame by frame (`src/scene.js`). It shows a hand tapping a phone, an exploded view of the glass, touch grid and display, field arcs bending to the finger, scan bars, a heat map, crosshairs, multi-touch, a pen, glove and fingernail failing, a stylus working, and a snowy sausage tap.
- **Voice:** Gemini TTS (voice *Achird*) with DTW-aligned captions.
- **Audio:** synthesized music plus touch effects.
