#!/usr/bin/env bash
# Render in short chunks, each in a fresh browser session (long sessions drift into washed-out lighting).
# usage: render_chunks.sh OUTDIR TOTAL_FRAMES [CHUNK] [LANES]
set -u
OUT=$1; TOTAL=$2; CH=${3:-90}; LANES=${4:-3}; mkdir -p "$OUT"
lane() { local L=$1; local s=$((L*CH)); while [ $s -lt $TOTAL ]; do e=$((s+CH)); [ $e -gt $TOTAL ] && e=$TOTAL
  f=$(printf "%s/c%05d.mp4" "$OUT" $s); [ -s "$f" ] || node "$(dirname "$0")/render.js" $s $e "$f" >/dev/null 2>&1; s=$((s+CH*LANES)); done; }
for L in $(seq 0 $((LANES-1))); do lane $L & done; wait
ls "$OUT"/c*.mp4 | sort | sed "s/.*/file '&'/" > "$OUT/list.txt"; echo "chunks: $(wc -l < "$OUT/list.txt")"
