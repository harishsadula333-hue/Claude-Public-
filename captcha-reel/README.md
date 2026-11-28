# Why "I'm not a robot" / CAPTCHA? 3D reel (Telugu, ~62 s)

**Final video:** `output/captcha-telugu.mp4` (1080×1920, 30 fps). There is no follow-us outro. The checkbox is a generic design; no Google or reCAPTCHA branding is used.

## Facts covered
- CAPTCHA stands for Completely Automated Public Turing test to tell Computers and Humans Apart. It blocks bots that create fake accounts, spam, and buy up tickets.
- The "I'm not a robot" checkbox is judged mostly on the behaviour before the click (mouse-movement path and timing) plus browser and other signals. Human paths are slightly irregular; scripted bots tend to move in straight, perfectly timed lines.
- When a CAPTCHA isn't sure, it asks for an image challenge (traffic lights, buses). Those answers have also been used to help label data and train machine-learning models.
- Older text CAPTCHAs used words that OCR couldn't read from scanned old books and newspaper archives, so solving them helped digitize those texts.
- Today, AI bots can solve many CAPTCHAs faster than people, so newer systems score visitors invisibly in the background (for example, a 0.0–1.0 "human score").

## How it's made
- **3D:** three.js, rendered frame by frame (`src/scene.js`). It shows a browser and checkbox, a robot swarm with spam and a shield, extruded 3D letters, human-vs-bot cursor paths, an image grid feeding a neural network, an old-book word being scanned, and a robot-vs-human race.
- **Voice:** Gemini TTS (voice *Achird*) with DTW-aligned captions.
- **Audio:** synthesized music and effects.
