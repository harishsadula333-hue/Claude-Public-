#!/usr/bin/env bash
# Builds sundarlysh_workshop_teaser.mp4 (needs python3+numpy, node+playwright, ffmpeg)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build
python3 audio.py build/soundtrack.wav
node render.js "$@"
