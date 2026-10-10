#!/usr/bin/env bash
# Import a teammate's word recordings for the Listen button.
# Usage (repo root):  bash scripts/add-word-clips.sh <folder-with-recordings>
# Name each file after its word, any audio format: gabi.m4a, pusa.wav, dahan-dahan.mp3 ...
# Each clip is trimmed of silence, loudness-normalized, made mono MP3 (about 5-10 KB), copied to
# public/audio/words/, and listed in src/content/wordClips.json.
set -euo pipefail
src="${1:?usage: bash scripts/add-word-clips.sh <folder>}"
out=public/audio/words
mkdir -p "$out"
shopt -s nullglob nocaseglob
n=0
for f in "$src"/*.{m4a,mp3,wav,ogg,webm,aac,3gp,opus}; do
  word=$(basename "${f%.*}" | tr '[:upper:]' '[:lower:]')
  ffmpeg -y -loglevel error -i "$f" \
    -af "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-18:TP=-2,apad=pad_dur=0.1" \
    -ac 1 -ar 22050 -b:a 48k "$out/$word.mp3"
  n=$((n + 1))
done
python - "$out" <<'PY'
import json, pathlib, sys
words = sorted(p.stem for p in pathlib.Path(sys.argv[1]).glob('*.mp3'))
pathlib.Path('src/content/wordClips.json').write_text(json.dumps(words, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(f'{len(words)} clips listed')
PY
echo "Imported $n recordings into $out"
