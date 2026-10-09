# Demo video (D4, issue #28)

`scripts/demo/record.mjs` records the D4 storyboard from a production build, with captions in the
picture, and writes an mp4 to `docs/demo/`. It is the same run every time, so the video can be
re-made after any change to the app.

## The two cuts

| Cut | Command | Speech input | File |
|---|---|---|---|
| Backup | `node scripts/demo/record.mjs` | Simulated with the dev switch `?fake`: the stub "hears" each sentence minus its last word. The video says so in its corner tag. | `docs/demo/kislap-demo-backup.mp4` (in the repo, 91 s) |
| Final | `node scripts/demo/record.mjs --voice <folder>` | A teammate's recordings go through the real on-device model. | `docs/demo/kislap-demo.mp4` |

`--voice` takes the golden clip names (`fixtures/README.md`): one clip per sentence of story 1,
`story-1-1_<reader>.m4a` to `story-1-8_<reader>.m4a`. Any format ffmpeg reads works. The script
feeds each clip to the app as its microphone, in the page, so no request leaves the device. Never
use a recording of someone who did not agree to it, and never a child's voice without written
parent consent.

## What is real in both cuts

- The production build, served by `vite preview`.
- The "Works offline" badge: the first run downloads the speech model (about 77 MB) into the
  browser profile in `scripts/demo/.profile`, before the recording starts.
- Internet off: the browser is set offline before the story starts, and stays offline.
- The request count in the corner tag comes from the recorder's own log of every request the page
  makes. It must read 0, and the run prints the list (empty) at the end. `docs/demo/last-run.json`
  keeps the count of the last run.
- Word marks, word help, stars, sticker, Word Pop and the firefly jar are the real screens.

## Storyboard (about 90 s)

1. Problem card: the World Bank figure (spec §1).
2. What Kislap is, in one sentence.
3. Home with the real "Works offline" badge.
4. Internet off.
5. Story map, then story 1 read sentence by sentence. Sentences 3 to 7 play faster (4x, or 8x
   with `--voice`), with a caption that says so.
6. Word help on a missed word: syllables and what Ningning heard.
7. Privacy meter open: 0 requests, and the recorder's count.
8. Result: stars, confetti, sticker.
9. Word Pop: the missed words as bubbles, syllables on tap, two pops (backup cut only; the final
   cut has no single-word clips).
10. Firefly jar.
11. Why local, and the link.

No "first" claim and no accuracy claim (spec §19). No music; the video is silent with captions.
Add a voice-over in an editor if the post needs sound.

## Run it

```bash
npm ci
npx playwright install chromium ffmpeg   # once; or set CHROME_PATH to a Chromium you have
node scripts/demo/record.mjs             # builds, serves, records, writes the mp4
```

Needs `ffmpeg` on `PATH` for the final encode. `--no-build` reuses `dist/`. `--out <dir>` writes
somewhere else.
