#!/usr/bin/env bash
# Builds Glassmates_November_2026.mp4 (1080x1920, 30fps).
# Order requested by the client (voice note):
#   1. Glassmates logo -> "say CHEERS to BEERS" -> founders' photo
#   2. Trio photo + Visa Tree logo: "November Glassmates party sponsored by Mr. Kiran"
#   3. The party video
#   4. Glassmates logo to close
# usage: [MUSIC_STYLE=swing|dhol|pop] ./build.sh <party_video.mp4> [work_dir]
set -euo pipefail
cd "$(dirname "$0")"
VIDEO="$1"
WORK="${2:-work}"
mkdir -p "$WORK"

INTRO=9; SPONSOR=9; OUTRO=6; XF=0.7
VD=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "$VIDEO")
OFF1=$(python3 -c "print(round($INTRO-$XF,3))")
OFF2=$(python3 -c "print(round($OFF1+$SPONSOR-$XF,3))")
OFF3=$(python3 -c "print(round($OFF2+$VD-$XF,3))")
TOTAL=$(python3 -c "print(round($OFF3+$OUTRO,3))")
FADE_END=$(python3 -c "print(round($TOTAL-0.9,3))")
LOWER_OUT=5.2
echo "video=${VD}s  sponsor@${OFF1}  video@${OFF2}  outro@${OFF3}  total=${TOTAL}s"

# 1) Render animated scenes + overlay graphics (skipped if frames already exist)
for s in intro:$INTRO sponsor:$SPONSOR outro:$OUTRO; do
  name=${s%%:*}; dur=${s##*:}
  [ -f "$WORK/$name/00000.jpg" ] || node scenes/render.js "scenes/$name.html" "$WORK/$name" "$dur" &
done
for o in bug badge lower; do
  [ -f "$WORK/ov_$o.png" ] || node scenes/render.js --still scenes/overlays.html "$WORK/ov_$o.png" 0 "#$o" &
done
wait

# 2) Soundtrack: original synth bed under intro/sponsor/outro, party audio in between
python3 make_music.py "$WORK/music.wav" "$TOTAL" "$OFF2" "$OFF3" "${MUSIC_STYLE:-swing}"

# 3) Assemble
VA_FADE_OUT=$(python3 -c "print(round($VD-$XF,3))")
ffmpeg -y -hide_banner -loglevel warning -stats \
  -framerate 30 -i "$WORK/intro/%05d.jpg" \
  -framerate 30 -i "$WORK/sponsor/%05d.jpg" \
  -framerate 30 -i "$WORK/outro/%05d.jpg" \
  -i "$VIDEO" \
  -loop 1 -framerate 30 -t "$VD" -i "$WORK/ov_bug.png" \
  -loop 1 -framerate 30 -t "$VD" -i "$WORK/ov_badge.png" \
  -loop 1 -framerate 30 -t "$VD" -i "$WORK/ov_lower.png" \
  -i "$WORK/music.wav" \
  -filter_complex "
    [0:v]fps=30,format=yuv420p,setsar=1,settb=AVTB[intro];
    [1:v]fps=30,format=yuv420p,setsar=1,settb=AVTB[sponsor];
    [2:v]fps=30,format=yuv420p,setsar=1,settb=AVTB[outro];
    [3:v]scale=1080:1920:flags=lanczos,unsharp=5:5:0.3,fps=30,setsar=1[pv];
    [6:v]format=rgba,fade=t=in:st=0.6:d=0.5:alpha=1,fade=t=out:st=${LOWER_OUT}:d=0.6:alpha=1[lower];
    [pv][4:v]overlay=780:60[p1];
    [p1][5:v]overlay=50:1740[p2];
    [p2][lower]overlay=50:1553,format=yuv420p,settb=AVTB[party];
    [intro][sponsor]xfade=transition=circleopen:duration=${XF}:offset=${OFF1}[x1];
    [x1][party]xfade=transition=smoothup:duration=${XF}:offset=${OFF2}[x2];
    [x2][outro]xfade=transition=fade:duration=${XF}:offset=${OFF3},fade=t=out:st=${FADE_END}:d=0.9[vout];
    [3:a]aresample=44100,aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,
         afade=t=in:st=0:d=0.6,afade=t=out:st=${VA_FADE_OUT}:d=${XF},adelay=$(python3 -c "print(int($OFF2*1000))"):all=1[va];
    [7:a][va]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[aout]
  " \
  -map "[vout]" -map "[aout]" \
  -c:v libx264 -preset slow -crf 23 -maxrate 4M -bufsize 8M -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 44100 -movflags +faststart \
  -t "$TOTAL" Glassmates_November_2026.mp4

ls -lh Glassmates_November_2026.mp4
