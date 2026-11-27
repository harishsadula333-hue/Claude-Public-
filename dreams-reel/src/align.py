"""Post-process the Gemini narration and derive word timings for captions.
1. Tighten long pauses (keeps natural rhythm, fits 50 s), resample to 48 kHz -> build/voice.wav
2. Build a reference reading of the same text with edge-tts (gives word boundaries)
3. DTW-align reference MFCCs to the Gemini audio and map every word start/end
Writes build/timeline.json + build/timeline.js (same format the animation uses)."""
import asyncio, json, os, re, ssl, subprocess, sys
import numpy as np, librosa, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__)); B = os.path.join(HERE, "..", "build")
SR = 48000
LEAD = 0.30          # silence before first word
MAXGAP = 0.36        # cap for pauses inside the narration
DRAMA_GAP = 0.50     # the pause right before the hook's "లేదు!" stays dramatic

# ---------------------------------------------------------------- script tokens
scenes = []
for line in open(os.path.join(HERE, "script.txt"), encoding="utf-8"):
    line = line.strip()
    if not line or line.startswith("# "): continue
    if line.startswith("#"): scenes.append({"name": line[1:], "tokens": []}); continue
    for tok in line.split():
        sp, sh = (tok.split("|", 1) + [None])[:2]
        scenes[-1]["tokens"].append({"s": sp, "d": (sh or sp).replace("_", " ")})
tokens = [dict(t, scene=sc["name"]) for sc in scenes for t in sc["tokens"]]

# ---------------------------------------------------------------- 1. pause tightening
raw, sr0 = librosa.load(os.path.join(B, "gemini_raw.wav"), sr=None)
y = librosa.resample(raw, orig_sr=sr0, target_sr=SR, res_type="soxr_hq")
iv = librosa.effects.split(y, top_db=38, frame_length=2048, hop_length=480)
# merge tiny gaps (<120 ms) -> they are inside words/phrases
merged = [list(iv[0])]
for a, b in iv[1:]:
    if (a - merged[-1][1]) / SR < 0.12: merged[-1][1] = b
    else: merged.append([a, b])
segs = []; pad = int(0.025 * SR)
for a, b in merged: segs.append(y[max(0, a - pad):min(len(y), b + pad)])
gaps_orig = [(merged[i + 1][0] - merged[i][1]) / SR for i in range(len(merged) - 1)]
hook_gaps = [k for k in range(len(gaps_orig)) if merged[k][1] / SR < 6.0]
drama_k = max(hook_gaps, key=lambda k: gaps_orig[k]) if hook_gaps else -1

# ---------------------------------------------------------------- 2. reference reading (edge-tts) with word boundaries
import edge_tts, edge_tts.communicate as ec
ec._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
TRANS = {"Permanent": "పర్మనెంట్", "Delete": "డిలీట్", "File": "ఫైల్", "File,": "ఫైల్,", "Storage": "స్టోరేజ్", "Blocks": "బ్లాక్స్",
         "Save": "సేవ్", "Address": "అడ్రస్", "List": "లిస్ట్", "Recycle": "రీసైకిల్", "Bin": "బిన్", "System": "సిస్టమ్", "Mark": "మార్క్",
         "Data,": "డేటా,", "Data": "డేటా", "Files": "ఫైల్స్", "Overwrite": "ఓవర్‌రైట్", "Recovery": "రికవరీ", "Software": "సాఫ్ట్‌వేర్",
         "SSD": "ఎస్‌ఎస్‌డీ", "Phones": "ఫోన్స్", "TRIM,": "ట్రిమ్,", "Encryption": "ఎన్‌క్రిప్షన్", "Gallery,": "గ్యాలరీ,", "Cloud": "క్లౌడ్",
         "Trash": "ట్రాష్", "Device": "డివైస్", "Recover": "రికవర్", "Shredder": "ష్రెడర్", "Tools": "టూల్స్", "Phone": "ఫోన్",
         "Factory": "ఫ్యాక్టరీ", "Reset": "రీసెట్", "Tech": "టెక్", "Facts": "ఫ్యాక్ట్స్", "Follow": "ఫాలో"}
async def ref_tts(text):
    c = edge_tts.Communicate(text, "te-IN-MohanNeural", boundary="WordBoundary")
    audio = b""; wb = []
    async for ch in c.stream():
        if ch["type"] == "audio": audio += ch["data"]
        elif ch["type"] == "WordBoundary": wb.append((ch["offset"] / 1e7, ch["duration"] / 1e7, ch["text"]))
    return audio, wb
ref_audio = [np.zeros(int(0.3 * SR))]; ref_words = []; tref = 0.3
# split tokens into sentences so the reference has the same pause structure
sent, sents = [], []
for i, t in enumerate(tokens):
    sent.append(i)
    if re.search(r"[.?!]$", t["s"]) or i == len(tokens) - 1: sents.append(sent); sent = []
for si, idx in enumerate(sents):
    text = " ".join(TRANS.get(tokens[i]["s"], tokens[i]["s"]) for i in idx)
    mp3 = os.path.join(B, f"ref_{si}.mp3")
    audio, wb = asyncio.run(ref_tts(text)); open(mp3, "wb").write(audio)
    a, _ = librosa.load(mp3, sr=SR)
    if len(wb) != len(idx):   # fall back: spread evenly across the sentence
        print("boundary mismatch in sentence", si, len(wb), len(idx), file=sys.stderr)
        st, en = wb[0][0], wb[-1][0] + wb[-1][1]
        wb = [(st + (en - st) * k / len(idx), (en - st) / len(idx), "") for k in range(len(idx))]
    s0 = max(0, wb[0][0] - 0.05); e0 = wb[-1][0] + wb[-1][1] + 0.08
    ref_audio.append(a[int(s0 * SR):int(e0 * SR)])
    for i, (o, d, _) in zip(idx, wb): ref_words.append((i, tref + o - s0, d))
    tref += e0 - s0
    ref_audio.append(np.zeros(int(0.3 * SR))); tref += 0.3
ref = np.concatenate(ref_audio)

# ---------------------------------------------------------------- 3. assemble tightened voice + DTW alignment
out = [np.zeros(int(LEAD * SR))]; t = LEAD; seg_times = []
for k, s in enumerate(segs):
    seg_times.append((t, len(s) / SR)); out.append(s); t += len(s) / SR
    if k < len(gaps_orig):
        g = max(0.0, min(gaps_orig[k], DRAMA_GAP if k == drama_k else MAXGAP) - 2 * pad / SR); out.append(np.zeros(int(g * SR))); t += g
voice = np.concatenate(out)

def feats(x):
    x16 = librosa.resample(x, orig_sr=SR, target_sr=16000)
    m = librosa.feature.mfcc(y=x16, sr=16000, n_mfcc=20, hop_length=160, n_fft=512)[1:]
    m = np.vstack([m, librosa.feature.delta(m)])
    return (m - m.mean(1, keepdims=True)) / (m.std(1, keepdims=True) + 1e-6)
Fr, Fq = feats(ref), feats(voice)
D, wp = librosa.sequence.dtw(X=Fr, Y=Fq, metric="cosine", backtrack=True)
wp = wp[::-1]
r2q = np.full(Fr.shape[1], -1)
for r, q in wp:
    if r2q[r] < 0: r2q[r] = q
def map_t(tr): f = int(round(tr * 100)); f = min(max(f, 0), len(r2q) - 1); return r2q[f] / 100.0

# speech activity of the final voice for snapping
act = librosa.effects.split(voice, top_db=38, frame_length=2048, hop_length=480) / SR
def snap_start(tq):
    for a, b in act:
        if a - 0.12 <= tq <= b: return max(tq, a)
        if tq < a - 0.12: return a if a - tq < 0.35 else tq
    return tq
words = []
for i, tr, dr in ref_words:
    ts, te = map_t(tr), map_t(tr + dr)
    words.append({"t": round(snap_start(ts), 3), "dur": round(max(0.12, te - ts), 3), "text": tokens[i]["d"],
                  "scene": tokens[i]["scene"], "end": bool(re.search(r"[.?!]$", tokens[i]["s"]))})
# sentence/clause starts snap to the end of the pause that precedes them
sil = [(act[i][1], act[i + 1][0]) for i in range(len(act) - 1) if act[i + 1][0] - act[i][1] > 0.18]
for k in range(1, len(words)):
    if not re.search(r"[,.?!]$", words[k - 1]["text"]): continue
    for a, b in sil:
        if words[k]["t"] - 0.7 <= b <= words[k]["t"] + 0.7 and (k + 1 >= len(words) or b < words[k + 1]["t"] + 0.3):
            if b > words[k]["t"]:
                if k + 1 < len(words) and words[k + 1]["t"] <= b + 0.08: words[k + 1]["t"] = round(b + 0.18, 3)
            words[k]["t"] = round(b, 3); break
for k in range(1, len(words)):   # keep monotonic
    words[k]["t"] = max(words[k]["t"], words[k - 1]["t"] + 0.06)
scene_marks = []
for sc in scenes:
    first = next(k for k, w in enumerate(words) if w["scene"] == sc["name"])
    scene_marks.append({"name": sc["name"], "t": round(max(0, words[first]["t"] - 0.08), 3), "first": first})

voice = voice / (np.abs(voice).max() + 1e-9) * 0.89
sf.write(os.path.join(B, "voice.wav"), voice, SR, subtype="PCM_16")
FPS = 30; hop = SR // FPS
env = [float(np.sqrt(np.mean(voice[i:i + hop] ** 2))) for i in range(0, len(voice), hop)]
mx = max(env); env = [round(min(1, e / mx * 1.6), 3) for e in env]
tl = {"voiceDur": round(len(voice) / SR, 3), "words": words, "scenes": scene_marks, "env": env}
json.dump(tl, open(os.path.join(B, "timeline.json"), "w"), ensure_ascii=False)
open(os.path.join(B, "timeline.js"), "w").write("window.TL = " + json.dumps(tl, ensure_ascii=False) + ";\n")
print("voice %.2fs | words %d | ref %.1fs" % (len(voice) / SR, len(words), len(ref) / SR))
for s in scene_marks: print("  %-8s %.2f" % (s["name"], s["t"]))
