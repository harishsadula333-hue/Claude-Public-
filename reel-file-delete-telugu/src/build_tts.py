"""Generate the Telugu narration sentence-by-sentence (te-IN-MohanNeural), trim silences,
join with controlled pauses, and write voice.wav + timeline.json (word timings, scenes)."""
import json, re, subprocess, sys, os
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "build"); os.makedirs(OUT, exist_ok=True)
TTS = "/tmp/claude-0/-home-user-Claude-Public-/50fee9e1-ef0d-5024-8c6d-cc6ea205a123/scratchpad/tools/tts.py"
TMP = "/tmp/claude-0/-home-user-Claude-Public-/50fee9e1-ef0d-5024-8c6d-cc6ea205a123/scratchpad/sent"; os.makedirs(TMP, exist_ok=True)
RATE = sys.argv[1] if len(sys.argv) > 1 else "+18%"
SR = 48000
LEAD = 0.45            # silence before first word
GAP_SENT, GAP_SCENE = 0.20, 0.30

scenes, cur = [], None
for line in open(os.path.join(HERE, "script.txt"), encoding="utf-8"):
    line = line.strip()
    if not line or line.startswith("# "): continue
    if line.startswith("#"):
        cur = {"name": line[1:], "sentences": [[]]}; scenes.append(cur); continue
    for tok in line.split():
        spoken, shown = (tok.split("|", 1) + [None])[:2]
        shown = (shown or spoken).replace(",,", ",").replace("_", " ")
        spoken = spoken[:-1] if spoken.endswith(",,") else spoken.rstrip(",")
        cur["sentences"][-1].append({"s": spoken, "d": shown})
        if re.search(r"[.?!]$", spoken): cur["sentences"].append([])
    cur["sentences"] = [s for s in cur["sentences"] if s]

def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)

audio = [np.zeros(int(LEAD * SR), np.float32)]
t = LEAD; words = []; scene_marks = []
for si, sc in enumerate(scenes):
    scene_marks.append({"name": sc["name"], "t": t, "first": len(words)})
    for k, sent in enumerate(sc["sentences"]):
        key = f"{si}_{k}"
        txt = " ".join(w["s"] for w in sent)
        open(f"{TMP}/{key}.txt", "w").write(txt)
        mp3, js = f"{TMP}/{key}.mp3", f"{TMP}/{key}.json"
        if not (os.path.exists(js) and json.load(open(js + ".meta")) == [txt, RATE] if os.path.exists(js + ".meta") else False):
            subprocess.run([sys.executable, TTS, f"{TMP}/{key}.txt", mp3, js, RATE], check=True)
            json.dump([txt, RATE], open(js + ".meta", "w"))
        wb = json.load(open(js)); a = decode(mp3)
        assert len(wb) == len(sent), (key, len(wb), len(sent), [w["w"] for w in wb])
        start = max(0.0, wb[0]["t"] - 0.06); end = min(len(a) / SR, wb[-1]["t"] + wb[-1]["d"] + 0.09)
        seg = a[int(start * SR):int(end * SR)].copy()
        fade = int(0.012 * SR); seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        for w, b in zip(sent, wb):
            words.append({"t": round(t + b["t"] - start, 3), "dur": round(b["d"], 3), "text": w["d"],
                          "scene": sc["name"], "end": bool(re.search(r"[.?!]$", w["s"]))})
        audio.append(seg); t += len(seg) / SR
        last = (k == len(sc["sentences"]) - 1)
        g = GAP_SCENE if last else GAP_SENT
        audio.append(np.zeros(int(g * SR), np.float32)); t += g

voice = np.concatenate(audio)
voice = voice / (np.abs(voice).max() + 1e-9) * 0.89
import scipy.io.wavfile as wf
wf.write(os.path.join(OUT, "voice.wav"), SR, (voice * 32767).astype(np.int16))
# per-frame mouth envelope (30 fps) for lip-sync
FPS = 30; hop = SR // FPS
env = [float(np.sqrt(np.mean(voice[i:i + hop] ** 2))) for i in range(0, len(voice), hop)]
m = max(env); env = [round(min(1, e / m * 1.6), 3) for e in env]
json.dump({"voiceDur": round(len(voice) / SR, 3), "words": words, "scenes": scene_marks, "env": env},
          open(os.path.join(OUT, "timeline.json"), "w"), ensure_ascii=False)
open(os.path.join(OUT, "timeline.js"), "w").write("window.TL = " + open(os.path.join(OUT, "timeline.json")).read() + ";\n")
print("voice duration %.2fs, words %d" % (len(voice) / SR, len(words)))
for s in scene_marks: print("  %-8s %.2f" % (s["name"], s["t"]))
