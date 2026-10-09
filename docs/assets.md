# Existing code and assets (D11, issue #35)

Everything in Kislap that the team did not make during the hackathon, with its source and licence.
Add a row in the same PR as any new library, font, sound, image, model, or dataset.

Last checked: 2026-10-09, against `package.json` and `node_modules` on `main` plus the open design PRs (#60, #61).

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
| `onnxruntime-web` (via Transformers.js) | 1.31.0-dev.20260914 | MIT | https://github.com/microsoft/onnxruntime | WebGPU / WebAssembly inference |
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

## Models and datasets

| Item | Licence / terms | Notes |
|---|---|---|
| `onnx-community/whisper-base` | No licence on the ONNX card; converted from `openai/whisper-base` (Apache-2.0) | Phone and bootstrap tier |
| `internetoftim/whisper-small-pld-fil-ONNX` | Model card: MIT | Laptop tier. Trained on PLD data: research and non-commercial use only |
| Filipino Speech Corpus (FSC) | Research use | Behind `sapinsapin/whisper-small-fsc` (stretch #17 only) |
| PLD | Research and non-commercial use | Behind the laptop-tier model |
| FLEURS `fil_ph` | CC-BY-4.0 | Only if LoRA ships |

Kislap is free and non-commercial, so the research-use terms are acceptable when disclosed
(`docs/validation.md` I8). The model engineer confirms this table in D8 (#32).

## Fonts

Self-hosted from npm, bundled by Vite and precached. No request goes to Google Fonts.

| Font | Package | Licence | Subsets | Used for |
|---|---|---|---|---|
| Baloo 2 (Ek Type) | `@fontsource/baloo-2` 5.3.0 | SIL OFL 1.1 | Latin, Latin Ext; 500/700/800 | Display, buttons, titles |
| Andika (SIL) | `@fontsource/andika` 5.3.0 | SIL OFL 1.1 | Latin, Latin Ext; 400/700 | Everything a child reads |

Added in PR #60 (#8).

## Art

All art is original, made for Kislap during the hackathon with Claude Design (see D12). None of it
copies an existing mascot, brand or character. The icon and mascot art came with a C2PA provenance manifest; the stickers' manifests were stripped when they moved to the paper look.

| File | What it is | Licence |
|---|---|---|
| `public/icons/kislap.svg` | App icon: Ningning on night green | Own work |
| `public/mascot/ningning-{idle,listening,thinking,cheering,encouraging,celebrating}.svg` | Ningning, six moods (source for `src/ui/Ningning.tsx`) | Own work |
| `public/stickers/sticker-{sampaguita,kubo,alitaptap,kalabaw,jeep,parol}.svg` | Six stickers | Own work |
| `public/stickers/sticker-*-locked.svg` | The same six, not yet earned | Own work |

Sticker art total: 33392 bytes, in the Claude Design part 2 paper look (cream die-cut edge, half the handoff's width; details in soft brown). `art/convert_stickers.py` made them from the v1 art.

## Sounds

No audio files. `src/game/sound.ts` makes four short, quiet tones (reveal, star, sticker, pop)
with the browser's Web Audio API on the device. Own work, 0 bytes to download. They follow the
Sound setting (on by default).

## AI tools used to make code, copy, or art

Listed in D12 (#36). Visual design, Ningning, stickers and the reworded copy came from Claude Design;
code from Claude Code.
