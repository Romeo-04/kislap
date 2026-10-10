# Existing code and assets (D11, issue #35)

Everything in Kislap that the team did not make during the hackathon, with its source and licence.
Add a row in the same PR as any new library, font, sound, image, model, or dataset.

Last checked: 2026-10-10, against `package.json` and `node_modules` on `main` plus PR #93 (Word Pop) and the demo recorder.

## No pre-existing project code

The event rule says everything must be built during the hackathon. The repository started on
2026-10-09 (first commit `f2adcd1`). The designer's work (#8 to #13, #45) adds no code from an
earlier project. Each teammate confirms the same for their own work in a comment on #35 before
it closes. The only reused text found so far is the git workflow in
`.claude/skills/git-operations/SKILL.md`, a process document ported from another project, not
application code.

## Libraries shipped to the browser

| Library | Version | Licence | Source | Used for |
|---|---|---|---|---|
| `@huggingface/transformers` | 4.3.1 | Apache-2.0 | https://github.com/huggingface/transformers.js | Runs Whisper on the device |
| `onnxruntime-web` (via Transformers.js) | 1.31.0-dev.20260914 | MIT | https://github.com/microsoft/onnxruntime | WebAssembly inference (WebGPU only with the `?tier=large` test switch, off by default) |
| `react`, `react-dom` | 19.3.0 | MIT | https://react.dev | Screens |
| `workbox-window` (via vite-plugin-pwa) | 7.4.1 | MIT | https://github.com/GoogleChrome/workbox | Service worker, offline shell |

## Build and test tools (not shipped)

| Tool | Version | Licence | Source |
|---|---|---|---|
| `vite` | 8.3.4 | MIT | https://vite.dev |
| `@vitejs/plugin-react` | 6.1.2 | MIT | https://github.com/vitejs/vite-plugin-react |
| `vite-plugin-pwa` | 2.0.0 | MIT | https://github.com/vite-pwa/vite-plugin-pwa |
| `vitest` | 5.0.3 | MIT | https://vitest.dev |
| `typescript` | 6.0.3 | Apache-2.0 | https://www.typescriptlang.org |
| `oxlint` | 1.87.0 | MIT | https://oxc.rs |
| `@types/node`, `@types/react`, `@types/react-dom` | 24.19.1, 19.3.0, 19.3.0 | MIT | https://github.com/DefinitelyTyped/DefinitelyTyped |
| `playwright` | 1.64.0 | Apache-2.0 | https://playwright.dev | Records the demo video (`scripts/demo/record.mjs`) |

Outside `package.json`: **FFmpeg** (LGPL/GPL, https://ffmpeg.org) encodes the demo video. It is a
tool on the recording machine; nothing from it ships in the app.

## Models and datasets

| Item | Licence / terms | Notes |
|---|---|---|
| `onnx-community/whisper-base` | No licence on the ONNX card; converted from `openai/whisper-base` (Apache-2.0) | Shipped: q8 on WebAssembly on every device. The fp16 WebGPU files load only with the `?tier=large` test switch |
| `internetoftim/whisper-small-pld-fil-ONNX` | Model card: MIT | Tested, not shipped. Trained on PLD data: research and non-commercial use only |
| Own int8 export `acmrsu/kislap-whisper-small` (of `sapinsapin/whisper-small-fsc`) | Base card: Apache-2.0. Our repo grants no rights beyond that | Tested, not shipped. Trained on FSC data. May not be viable for the App Builders Challenge |
| Filipino Speech Corpus (FSC) | Research use | Behind `sapinsapin/whisper-small-fsc` (tested, not shipped) |
| PLD | Research and non-commercial use | Behind `internetoftim/whisper-small-pld-fil-ONNX` (tested, not shipped) |
| FLEURS `fil_ph` | CC-BY-4.0 | Only if LoRA ships |

Neither Filipino model ships, so no research-use data reaches users. If one ships later, D8 and D11 must
say so, and the App Builders Challenge rules must be checked first (`docs/validation.md` I8). The model engineer
confirms this table in D8 (#32).

## Fonts

Self-hosted from npm, bundled by Vite and precached. No request goes to Google Fonts.

| Font | Package | Licence | Subsets | Used for |
|---|---|---|---|---|
| Baloo 2 (Ek Type) | `@fontsource/baloo-2` 5.3.0 | SIL OFL 1.1 | Latin, Latin Ext; 500/700/800 | Display, buttons, titles |
| Andika (SIL) | `@fontsource/andika` 5.3.0 | SIL OFL 1.1 | Latin, Latin Ext; 400/700 | Everything a child reads |

Added in PR #60 (#8).

## Art

All art is original, made for Kislap during the hackathon with Claude Design (see D12). None of it
copies an existing mascot, brand or character. No SVG carries a provenance manifest: Ningning (drawn
in code) and the app icon were redrawn from the Claude Design part 2 handoff without one, and the
stickers' manifests were stripped when they moved to the paper look, since editing the art
invalidates them.

| File | What it is | Licence |
|---|---|---|
| `public/icons/kislap.svg` | App icon: Ningning the paper puppet on the day sky (Claude Design part 2) | Own work |
| `src/ui/Ningning.tsx` | Ningning the paper puppet, six moods, drawn in code from the Claude Design part 2 `Ningning.dc.html` | Own work |
| `public/stickers/sticker-{sampaguita,kubo,alitaptap,kalabaw,jeep,parol}.svg` | Six stickers | Own work |
| `public/stickers/sticker-*-locked.svg` | The same six, not yet earned | Own work |
| `public/audio/words/*.mp3` | 85 story-word recordings for the Listen button | Own work: recorded by the lead (Jhezra Tolentino), trimmed and normalized with `scripts/add-word-clips.sh` |

Sticker art total: 34,810 bytes, in the Claude Design part 2 paper look: a cream die-cut edge at
half the handoff's width, printed lines in the cut line colour, every colour from the paper tokens,
and locked stickers in cream paper with a dashed cut line. `art/convert_stickers.py` made them from
the v1 art, which is only in git history (commit 4121890); the script header says how to rebuild.

## Sounds

No audio files. `src/game/sound.ts` makes four short, quiet tones (reveal, star, sticker, pop)
with the browser's Web Audio API on the device. Own work, 0 bytes to download. They follow the
Sound setting (on by default).

## Demo video

`docs/demo/kislap-demo-backup.mp4` is own work: a screen recording of the app with captions, made
by `scripts/demo/record.mjs` (docs/demo-video.md). No music, stock footage or third-party images.

## AI tools used to make code, copy, or art

Listed in D12 (#36). Visual design, Ningning, stickers and the reworded copy came from Claude Design;
code from Claude Code.
