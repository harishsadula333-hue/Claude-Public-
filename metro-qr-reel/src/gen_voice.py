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
## Young Telugu creator from Hyderabad, late 20s, male, a regular metro commuter.

## THE SCENE: Ravi is walking a close friend through Hyderabad Metro, explaining how the ticket gates work. Recorded for an Instagram reel.

### DIRECTOR'S NOTES
Style: Warm, friendly and connected, like chatting with a friend he cares about. Natural everyday Telugu, never a news reader. Curious and inviting at the start ("రండి, కలిసి చూద్దాం"), little smiles in the voice, light surprise on interesting facts, a playful tone on the two-people trick, cheerful ending.
Pace: Lively but relaxed reel pace, short natural pauses between sentences.
Accent: Native Telugu (Hyderabad). English tech words said the way Telugu people normally say them.

#### TRANSCRIPT
"""
open(os.path.join(OUT, "transcript.txt"), "w").write(transcript)
mime, dur = gemini.tts(head + transcript, voice=sys.argv[1] if len(sys.argv) > 1 else "Achird",
                       model="gemini-3.8-flash-tts", out_wav=os.path.join(OUT, "gemini_raw.wav"))
print("generated", mime, round(dur, 2), "s")
