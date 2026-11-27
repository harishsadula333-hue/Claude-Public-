"""Generate the whole narration in ONE Gemini TTS call (most natural flow), voice Achird."""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
import gemini
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "build")
lines = []
for line in open(os.path.join(HERE, "script.txt"), encoding="utf-8"):
    line = line.strip()
    if not line or line.startswith("#"): continue
    lines.append(" ".join(t.split("|")[0] for t in line.split()))
transcript = "\n".join(lines)
head = """# AUDIO PROFILE: Ravi
## Young Telugu tech creator from Hyderabad, late 20s, male, loves bikes and cars.

## THE SCENE: Ravi is explaining to a curious friend how petrol and diesel actually move vehicles, recorded for an Instagram reel.

### DIRECTOR'S NOTES
Style: Warm, friendly and energetic, like an excited friend sharing a cool fact. Natural everyday Telugu, never a news reader. A curious, playful hook; real excitement on the "explosion" and the diesel self-ignition; clear and confident on the facts; satisfying, upbeat finish.
Pace: Lively reel pace, short natural pauses.
Accent: Native Telugu (Hyderabad). English technical words said the way Telugu people normally say them.

#### TRANSCRIPT
"""
open(os.path.join(OUT, "transcript.txt"), "w").write(transcript)
mime, dur = gemini.tts(head + transcript, voice=sys.argv[1] if len(sys.argv) > 1 else "Achird",
                       model="gemini-3.8-flash-tts", out_wav=os.path.join(OUT, "gemini_raw.wav"))
print("generated", mime, round(dur, 2), "s")
