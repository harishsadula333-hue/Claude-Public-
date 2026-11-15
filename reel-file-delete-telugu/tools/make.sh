#!/usr/bin/env bash
# Full pipeline: narration -> frames -> music/SFX mix -> final MP4.
# Needs: python3 (numpy, scipy, edge-tts), node + playwright (chromium), ffmpeg.
set -euo pipefail
cd "$(dirname "$0")/.."
SEG="${SEG_DIR:-build/segments}"; mkdir -p "$SEG"
python3 src/build_tts.py "+24%"                 # Telugu voice (te-IN-MohanNeural) + word timings
node tools/render.js 0 500    "$SEG/s0.mp4" &   # frames rendered in 3 parallel workers
node tools/render.js 500 1000 "$SEG/s1.mp4" &
node tools/render.js 1000 1500 "$SEG/s2.mp4" &
wait
python3 tools/audio.py                          # original music + SFX + ducking -> build/mix.wav
printf "file '%s'\n" "$PWD/$SEG/s0.mp4" "$PWD/$SEG/s1.mp4" "$PWD/$SEG/s2.mp4" > "$SEG/list.txt"
ffmpeg -y -v error -f concat -safe 0 -i "$SEG/list.txt" -i build/mix.wav \
  -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 \
  -movflags +faststart -shortest output/file-delete-telugu-reel.mp4
echo "done -> output/file-delete-telugu-reel.mp4"
