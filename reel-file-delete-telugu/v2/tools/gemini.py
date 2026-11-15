"""Small Gemini REST helper. The API key comes from $GEMINI_API_KEY or from a file named by $GEMINI_KEY_FILE
(containing GEMINI_API_KEY=...). Never commit the key."""
import base64, json, os, re, sys, time, urllib.request, urllib.error
def key():
    if os.environ.get("GEMINI_API_KEY"): return os.environ["GEMINI_API_KEY"].strip()
    for line in open(os.environ["GEMINI_KEY_FILE"]):
        if line.startswith("GEMINI_API_KEY="): return line.split("=", 1)[1].strip()
def call(model, body, tries=6, timeout=300):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    data = json.dumps(body).encode()
    for i in range(tries):
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", "x-goog-api-key": key()})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r: return json.load(r)
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:400]
            print(f"HTTP {e.code} (try {i+1}): {msg}", file=sys.stderr)
            if e.code in (429, 500, 502, 503, 504): time.sleep(min(60, 5 * 2 ** i)); continue
            raise
    raise RuntimeError("gemini call failed")
def tts(text, voice="Charon", model="gemini-3.8-flash-tts", out_wav=None):
    body = {"contents": [{"parts": [{"text": text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
    r = call(model, body)
    part = r["candidates"][0]["content"]["parts"][0]["inlineData"]
    raw = base64.b64decode(part["data"]); mime = part.get("mimeType", "")
    import wave, io
    if raw[:4] == b"RIFF":
        if out_wav: open(out_wav, "wb").write(raw)
        with wave.open(io.BytesIO(raw)) as w: dur = w.getnframes() / w.getframerate()
    else:
        rate = int(re.search(r"rate=(\d+)", mime).group(1)) if "rate=" in mime else 24000
        if out_wav:
            with wave.open(out_wav, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(raw)
        dur = len(raw) / 2 / rate
    return mime, dur
def image(prompt, out, model="gemini-3.1-flash-image", aspect="9:16", size=None):
    cfg = {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect}}
    if size: cfg["imageConfig"]["imageSize"] = size
    r = call(model, {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": cfg})
    for p in r["candidates"][0]["content"]["parts"]:
        if "inlineData" in p:
            open(out, "wb").write(base64.b64decode(p["inlineData"]["data"])); return p["inlineData"]["mimeType"]
    raise RuntimeError("no image: " + json.dumps(r)[:300])
def ask(parts, models=("gemini-3.8-flash", "gemini-3.5-flash", "gemini-2.5-flash")):
    for m in models:
        try: r = call(m, {"contents": [{"parts": parts}]}, tries=2, timeout=75); break
        except Exception as e: print("ask fallback:", m, str(e)[:80], file=sys.stderr)
    return "".join(p.get("text", "") for p in r["candidates"][0]["content"]["parts"])
