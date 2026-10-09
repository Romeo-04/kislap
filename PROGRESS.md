# Kislap — progress

Update this file in the same PR as the work. Newest notes on top in the log. Times are Asia/Manila.
Issues: https://github.com/Romeo-04/kislap/issues · Tracker: #40

## Now

- **Phase:** Checkpoint 2 met (full loop with the real model, offline). Next gate: **feature freeze at 01:00**.
- **Deployed URL:** https://kislap.vercel.app (device check: https://kislap.vercel.app/#/mictest)
- **Speech model in use:** bootstrap `onnx-community/whisper-base` q8, in a Web Worker (#14; model check page: `/#/asrtest`); laptop target `internetoftim/whisper-small-pld-fil-ONNX` (#16, Q1 = A)
- **Flutter spike:** closed, not run (#48). Web app stays (ADR-0002).
- **Visual design:** Claude Design handoff in `docs/design/claude-design-handoff.md` (brief: `docs/design-handoff.md`).

## Checkpoints

| Gate | Time | Must be true | Status |
|---|---|---|---|
| Checkpoint 1 | 19:00 Oct 9 | Model transcribes a real recording in the browser (laptop + phone). UI works with fake data. Scorer tests pass. | ✅ met late on the laptop: model in browser (#59), UI kit (#60–#63), scorer tests (#58). Phone: mic check passed; phone transcription speed not yet measured (#15) |
| Checkpoint 2 | 00:00 Oct 10 | Full Must loop works end to end | ✅ 23:10 on the integrated build: real Whisper-base, offline, Reading → Result (#72 + #59 + #58) |
| Feature freeze | 01:00 Oct 10 | Offline check passes on laptop + Poco X6 Pro. Bug fixes only after this. | ⏳ |
| Submission | 08:30 Oct 10 (hard 10:00) | Form submitted, X + LinkedIn posts up | ⏳ |
| Demo Day | 13:00–19:00 Oct 10 | Live pitch at Cyberzone SM Makati | ⏳ |

## Owners and tasks

Each person has one epic. Ticking an atomic issue = closing it. Legend: ⏳ open · 🔨 in progress · ✅ done.

### Lead (@Romeo-04) — epic #41

| # | Task | Gate | Status |
|---|---|---|---|
| #1 | Scaffold Vite + React + TS PWA, deploy to Vercel | CP1 | ✅ closed; phone mic check passed |
| #2 | Audio recorder, level meter, silence gate, auto-stop | CP1 | 🔨 PR open (verified in Chrome with fake mic) |
| #3 | Reading loop integration | CP2 | ✅ merged (#72); full loop verified with the real model |
| #4 | On-device progress | CP2 | 🔨 PR open (17 tests, verified in Chrome) |
| #5 | Offline ready | Freeze | 🔨 merged (#55); last check: full story offline on production |
| #6 | Privacy meter (Should) | Freeze | ✅ merged (#54) |
| #7 | Demo Day kit | Demo | 🔨 kit merged (#56); rehearsal + night-before checks left |
| D1 #25, D2 #26, D3 #27, D5 #29, D9 #33, D10 #34, D12 #36, D13 #37, D15 #39 | Deliverables | — | ⏳ |

### Designer (@Seedlign) — epic #42

| # | Task | Gate | Status |
|---|---|---|---|
| #8 | Design tokens and UI kit | CP1 | 🔨 PR open (Claude Design tokens, Baloo 2 + Andika, kit in `src/ui/`) |
| #9 | Ningning SVG, 6 moods, glow | CP1 | 🔨 PR open (Claude Design art, stacked on #8) |
| #10 | Core screens: Home, Story map, Reading, Result | CP1 | 🔨 PR open: candy adventure design + mobile-native shell |
| #11 | Sounds and Sticker art | CP2 | 🔨 PR open (12 sticker SVGs, Web Audio tones, `docs/assets.md`) |
| #12 | Sticker jar + progress screen (Should) | Freeze | ⏳ |
| #13 | Word Pop (Should) | Freeze | ⏳ |
| #45 | Mic-check screen (Should) | Freeze | ⏳ |
| #48 | Flutter spike (45 min, decide by 17:00) | 17:00 | ✅ closed, not run |
| D4 #28, D11 #35 | Deliverables | — | ⏳ D11 draft in `docs/assets.md` |

### Model engineer (@acmrsu) — epic #43

| # | Task | Gate | Status |
|---|---|---|---|
| #14 | ASR worker with bootstrap Whisper-base | CP1 | 🔨 PR open |
| #15 | Device benchmark: laptop + Poco X6 Pro | CP1 | ⏳ |
| #16 | Model tiers (Filipino small on laptop, base on phone) | CP2 | ⏳ |
| #17 | Stretch: export whisper-small-fsc q4f16 (stop 22:00) | CP2 | ⏳ |
| #18 | Golden recordings + eval script | CP2 | ⏳ |
| #47 | Local progress QR (Should) | Freeze | ⏳ |
| D6 #30, D7 #31, D8 #32 | Deliverables | — | ⏳ |

### Content, scoring & QA (@emyol) — epic #44

| # | Task | Gate | Status |
|---|---|---|---|
| #19 | Three original stories | CP1 | 🔨 Implemented and verified; awaiting PR review |
| #20 | Forgiving scorer + ≥ 10 tests | CP1 | 🔨 Implemented and verified; awaiting PR review |
| #21 | Syllable help (pantig) (Should) | Freeze | ⏳ |
| #22 | i18n copy fil + en | CP2 | 🔨 Copy and scaffold wiring verified; open for suggestions and integrated UI review |
| #23 | Tune scoring on golden recordings | Freeze | ⏳ |
| #24 | Device QA, offline + network checks | Freeze | ⏳ |
| #46 | Echo reading with teammate audio (Should) | Freeze | ⏳ |
| D14 #38 | Deliverable | — | ⏳ |

## Measurements (fill at Checkpoint 1)

| Device | Tier / model / dtype | Backend | Download MB | Load s | 4 s sentence s | Notes |
|---|---|---|---|---|---|---|
| Laptop (Chrome) | small / whisper-base / q8 | wasm | ~77 | 32.2 | 2.8 | Bench page `/#/bench`. First inference 3.4 s. Load includes download. |
| Laptop (Chrome) | small / whisper-base / q4 | webgpu | | 53.3 | 1.3 | First inference 4.4 s. 2x faster than WASM, but the text was worse: "Simimi ay nasak inanin ng nangong lamesak ah." |
| Laptop (Chrome) | large / whisper-small-pld-fil-ONNX / enc fp32 + dec q4 | webgpu | ~586 | 219.7 | – | **Fails at inference:** `Missing the following inputs: cache_position`. Transformers.js 4.3.1 never sends `cache_position`; the model's merged decoder asks for it. Blocks Q1 option A until fixed. |
| Poco X6 Pro (Chrome) | | | | | | |

## Open decisions (grill round 1 — see `docs/validation.md`)

- Q1–Q7 settled (see `docs/validation.md` grill log).

## Log

- **2026-10-09 23:55** — D2 and D12 filled: team stochastic4 (Jhezra Tolentino, Ric Ian Barrios, Amiel Josiah Acuna, Marcus Ceasar Austria) and the AI tools (ChatGPT, Claude, Claude Code and skills, Claude Design, CodeRabbit). Members confirm spelling on #26.
- **2026-10-09 23:55** — Candy adventure design (Home, map, stickers, mic check, Word Pop) and a mobile-native shell for phones: bottom tabs, settings sheet, thumb-reach mic, haptics, theme-colour status bar. All its copy moved to i18n.
- **2026-10-09 23:10** — Checkpoint 2: #59 (model, re-reviewed and approved), #62, #58 (+ lead fixes #73) and #72 (reading loop) merged. Real Whisper-base read a spoken sentence offline in 9.6 s with 0 third-party requests. Disclosures, LICENSE and post text in #74. Team name: stochastic4. #1 closed (phone mic check passed).
- **2026-10-09 21:27** — #19 / PR #53: revised the stories for a clearer reading progression. The easy story uses short, familiar words and a complete cat-and-firefly plot; the medium story has a garden problem and resolution; the hard story uses longer clauses and Taglish. Each has eight sentences of four to ten words. Content checks, the existing test, typecheck, and build pass. Awaiting teammate review.
- **2026-10-09 21:18** — #22: expanded both language dictionaries with incoming UI/offline keys and four cheering/encouraging variants each. Localized scaffold screen labels, mascot states, and accessible controls. Eight tests and build pass; lint has only the existing i18n Fast Refresh warning. Independent diff review found no blockers. The user approved the wording while asking to keep the issue open for suggestions. Final integrated UI and confirmed native-speaker review remain in `docs/i18n-review.md`.
- **2026-10-09 19:30** — #11: sticker art mapped to stories by level (`src/content/stickers.ts`), soft Web Audio sounds (`src/game/sound.ts`), sound/night setting under `kislap.settings.v1`, D11 draft `docs/assets.md`.
- **2026-10-09 19:15** — #9: `src/ui/Ningning.tsx` draws the Claude Design firefly (6 moods, glow 0.3 to 1, named groups), motion in CSS with a still pose under reduced motion. App icon replaced. #48 closed, not run (Android toolchain not ready).
- **2026-10-09 19:10** — #15: benchmark page at `/#/bench` (three setups, one worker each, copyable table). Laptop results are in the table above. The large Filipino model fails with `cache_position` missing. The Poco X6 Pro run is still open: the lead needs to open the page on the phone once it is deployed.
- **2026-10-09 19:05** — #8: Claude Design tokens (`src/styles/tokens.css`), self-hosted Baloo 2 + Andika, all handoff copy in i18n, UI kit in `src/ui/`. Placeholder screens keep working through a legacy block in `base.css` until #10.
- **2026-10-09 18:45** — #14: real Whisper worker and client in `src/asr/` (load with byte progress, transcribe with transferred audio, `isModelCached`, `warmUp`). Model check page at `/#/asrtest`. `transcribe()` loads the model itself (from the cache after the first download). Fake mode is dev only: add `?fake` to the URL. Worker contract gains `warmed`, `iscached`, and `cached` messages. A worker crash rejects every waiting request and the next call starts a fresh worker. ONNX Runtime files now come from our own site, not jsDelivr, and are cached at runtime for offline use. Tested on a laptop in Chrome with a real recording.
- **2026-10-09 17:53** — #19 / PR #53: applied the three grammar corrections from review (Dumapo, Sabay silang umuwi, Dahan-dahan) and added quotation marks to Ben's dialogue. Story IDs, levels, and sentence counts are unchanged. Awaiting teammate approval.
- **2026-10-09 17:46** — #20: replaced the membership-only scorer with Unicode normalization and weighted word alignment. Number and spelling variants match, extra speech is ignored in accuracy, and unclear words earn half credit. Story spelling and punctuation remain visible. All 41 tests and the production build pass; lint exits successfully with the existing i18n Fast Refresh warning. Real-recording tuning remains #23. Awaiting teammate review.
- **2026-10-09 17:37** — #19: replaced the scaffold stories with three original stories in Ningning's world. Eight sentences each, four to ten words per sentence, bilingual titles, and stable story IDs. Content checks, the existing test, build, and lint pass. Awaiting teammate review.
- **2026-10-09 16:30** — @Seedlign accepted the invite; all designer issues (#8–#13, #28, #35, #42, #45, #48) assigned.
- **2026-10-09 16:20** — Scaffold up (#1): contract stubs for every module, fake reading loop works, live on Vercel. Every owner can branch from `main` once the PR merges.
- **2026-10-09 16:05** — Q7: issues assigned by role (designer pending invite).
- **2026-10-09 15:55** — Grill round 1 settled Q1–Q6: Filipino ONNX on laptop, all six creative additions (#45–#47 new), sticker on every finish (ADR-0010), Eden removed (ADR-0009 accepted). Flutter spike delegated (#48).
- **2026-10-09 15:45** — Repo bootstrapped: spec validated (`docs/validation.md`), architecture,
  9 ADRs, 7 UML diagrams, glossary. 5 milestones, 44 issues (24 tasks, 15 deliverables,
  tracker, 4 epics with sub-issues).
