#!/usr/bin/env bash
# v2 pipeline: Gemini voice -> word alignment -> animated graphics frames -> music/SFX mix -> MP4
# Needs GEMINI_KEY_FILE (a file containing GEMINI_API_KEY=...), python3 (numpy scipy librosa soundfile edge-tts), node + playwright, ffmpeg.
set -euo pipefail
cd "$(dirname "$0")/.."
SEG="build/segments"; mkdir -p "$SEG" output
python3 src/gen_voice.py Achird            # one Gemini TTS call, whole narration (natural flow)
python3 src/align.py                       # tighten pauses + word timings for captions
node tools/render.js 0 500    "$SEG/s0.mp4" & node tools/render.js 500 1000 "$SEG/s1.mp4" & node tools/render.js 1000 1500 "$SEG/s2.mp4" & wait
python3 tools/audio.py
printf "file '%s'\n" "$PWD/$SEG/s0.mp4" "$PWD/$SEG/s1.mp4" "$PWD/$SEG/s2.mp4" > "$SEG/list.txt"
ffmpeg -y -v error -f concat -safe 0 -i "$SEG/list.txt" -i build/mix.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest output/file-delete-telugu-reel-v2.mp4
