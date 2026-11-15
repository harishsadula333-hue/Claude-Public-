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

## THE SCENE: A bright home studio. Ravi is recording an Instagram reel for his Telugu followers, explaining a surprising tech fact like he is telling a friend.

### DIRECTOR'S NOTES
Style: Natural, warm, everyday conversational Telugu, the way a real person talks to a friend, not a news reader. A curious, intriguing hook at the start, a firm "లేదు!", genuine surprise on "Data అక్కడే ఉంటుంది", serious on the warning, friendly and upbeat in the tips and the ending.
Pace: Brisk, energetic Instagram-reel pace with only short natural pauses between sentences.
Accent: Native Telugu (Andhra/Telangana). English tech words are said the way Telugu people normally say them in daily speech.

#### TRANSCRIPT
"""
open(os.path.join(OUT, "transcript.txt"), "w").write(transcript)
mime, dur = gemini.tts(head + transcript, voice=sys.argv[1] if len(sys.argv) > 1 else "Achird",
                       model="gemini-3.8-flash-tts", out_wav=os.path.join(OUT, "gemini_raw.wav"))
print("generated", mime, round(dur, 2), "s")
