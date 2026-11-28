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
## Young Telugu tech creator from Hyderabad, late 20s, male.

## THE SCENE: Ravi is chatting with a close friend who just got stuck on a CAPTCHA, explaining the secret behind it. Recorded for an Instagram reel.

### DIRECTOR'S NOTES
Style: Warm, friendly, human and a little playful, like explaining a cool secret to a buddy. Natural everyday Telugu with smiles in the voice, never a news reader. Curious hook, a "here's the secret" tone on the mouse-movement part, genuine surprise on the AI-training and old-books facts, a slightly dramatic, impressed tone on the AI bots at the end.
Pace: Lively but relaxed reel pace, short natural pauses.
Accent: Native Telugu (Hyderabad). English tech words said the way Telugu people normally say them; "I'm not a robot" said in natural Indian English.

#### TRANSCRIPT
"""
open(os.path.join(OUT, "transcript.txt"), "w").write(transcript)
mime, dur = gemini.tts(head + transcript, voice=sys.argv[1] if len(sys.argv) > 1 else "Achird",
                       model="gemini-3.8-flash-tts", out_wav=os.path.join(OUT, "gemini_raw.wav"))
print("generated", mime, round(dur, 2), "s")
