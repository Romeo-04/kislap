# Kislap — progress

Update this file in the same PR as the work. Newest notes on top in the log. Times are Asia/Manila.
Issues: https://github.com/Romeo-04/kislap/issues · Tracker: #40

## Now

- **Phase:** Checkpoint 2 met (full loop with the real model, offline). Next gate: **feature freeze at 01:00**.
- **Deployed URL:** https://kislap.vercel.app (device check: https://kislap.vercel.app/#/mictest)
- **Speech model in use:** `onnx-community/whisper-base` q8 on WebAssembly, on every device, in a Web Worker (model check page: `/#/asrtest`). The fp16 WebGPU tier runs only with `?tier=large` (#16, PR #75).
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
| #8 | Design tokens and UI kit | CP1 | 🔨 PR open: part 2 paper puppet tokens, kit, `PaperScene`, `Wordmark` (`docs/design/paper-puppet.md`) |
| #9 | Ningning SVG, 6 moods, glow | CP1 | ✅ done (PR #61); part 2 paper puppet redraw in PR #87 (wings on brass pins, stick, thinner edge) |
| #10 | Core screens: Home, Story map, Reading, Result | CP1 | 🔨 PR open: Home, Story map, Reading (five states) and Result in the paper look, phone and desktop |
| #11 | Sounds and Sticker art | CP2 | ✅ done (PR #63); part 2 paper look for the stickers in PR #83 |
| #12 | Sticker jar + progress screen (Should) | Freeze | 🔨 PR open: firefly jar in the paper look (floating stickers, tap to see big, days, goal ring, stars), phone and desktop |
| #13 | Word Pop (Should) | Freeze | 🔨 PR open: paper bubbles from the Practice words, say one to pop it (similarity ≥ 0.6), pops anyway after 2 tries, tap for syllables |
| #45 | Mic-check screen (Should) | Freeze | 🔨 PR open: Mic check + Settings in the paper look, phone and desktop |
| #48 | Flutter spike (45 min, decide by 17:00) | 17:00 | ✅ closed, not run |
| D4 #28, D11 #35 | Deliverables | — | ⏳ D11 draft in `docs/assets.md` |

### Model engineer (@acmrsu) — epic #43

| # | Task | Gate | Status |
|---|---|---|---|
| #14 | ASR worker with bootstrap Whisper-base | CP1 | 🔨 PR open |
| #15 | Device benchmark: laptop + Poco X6 Pro | CP1 | ⏳ |
| #16 | Model tiers (Filipino small on laptop, base on phone) | CP2 | 🔨 PR #75: base q8 WASM on every device; fp16 WebGPU only with `?tier=large` |
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
| #24 | Device QA, offline + network checks | Freeze | 🔨 `docs/qa.md` prepared; #68 fixed by #84; device checks pending |
| #46 | Echo reading with teammate audio (Should) | Freeze | ⏳ |
| D14 #38 | Deliverable | — | ⏳ |

## Measurements (fill at Checkpoint 1)

| Device | Tier / model / dtype | Backend | Download MB | Load s | 4 s sentence s | Notes |
|---|---|---|---|---|---|---|
| Laptop (Chrome) | small / whisper-base / q8 | wasm | ~77 | 32.2 | 2.8 | Bench page `/#/bench`. First inference 3.4 s. Load includes download. |
| Laptop (Chrome) | small / whisper-base / q4 | webgpu | | 53.3 | 1.3 | First inference 4.4 s. 2x faster than WASM, but the text was worse: "Simimi ay nasak inanin ng nangong lamesak ah." |
| Laptop (Chrome) | large / whisper-small-pld-fil-ONNX / enc fp32 + dec q4 | webgpu | ~586 | 219.7 | – | **Fails at inference:** `Missing the following inputs: cache_position`. Transformers.js 4.3.1 never sends `cache_position`; the model's merged decoder asks for it. Blocks Q1 option A until fixed. |
| Laptop (Chrome) | own export of whisper-small-fsc, int8 (`--arm64` recipe) | wasm | ~278 | 2.8 | 11.0 | **Research-use data: may not be viable for the App Builders Challenge.** Works: no `cache_position` input. Heard "si Mimi ay nasa ilalim ng lamesa". Too slow for the 2 s target. |
| Laptop (Chrome) | same, int8 | webgpu | ~278 | 4.3 | 26.2 | Same research-data warning. Slower than WASM: int8 ops are not GPU friendly. |
| Laptop (Chrome) | same export, unquantized fp32 | webgpu | ~1070 | 11.6 | 5.9 | Same research-data warning. Heard "Simimi ay nasa ilalim ng lamesa." Still above 2 s, and far too big to ship. |
| Phone, not a Poco (Chrome) | small / whisper-base / q8 | wasm | ~77 | 3.3 | 10.5 | Above the 4 s target. First inference 8.3 s. Heard "Simimi ay nasa ilalim ng lamesa." |
| Phone, not a Poco (Chrome) | small / whisper-base / q4 | webgpu | | 4.5 | 97.5 | Unusable. Never use WebGPU on this phone. |
| Phone, not a Poco (Chrome) | large / whisper-small-pld-fil-ONNX | webgpu | ~586 | – | – | Download failed: network error. |
| Phone, not a Poco (Chrome) | small / whisper-tiny / q8 | wasm | ~39 | 20.5 | 4.0 | Meets the 4 s target. Text is rougher: "Simimi, ay na sa ilalim na laversa." |
| Poco X6 Pro (Chrome) | small / whisper-base / q8 | wasm | ~73 | | 4–5 (whole read, easy story) | Measured by the lead 06:45: marks correct. |

All rows used the same sentence, "si Mimi ay nasa ilalim ng lamesa", but each run used a new recording, so the transcripts compare only roughly. The golden recordings (#18) are the fair test.

**What the speed numbers suggest (for #16, the lead decides; PR #75 implements it):** laptop = `whisper-base` q4 on WebGPU (1.3 s). Phone = `whisper-base` q8 on WASM (10.5 s on the Realme; `tiny` is 4.0 s but misses far more words). Phone WebGPU: never. The Filipino models are the most accurate but too slow and too large for the speed targets. See the golden-clip results below.

### Golden clips, 32 clips on four setups (2026-10-10)

One adult reader, the final stories (`74bac56`), laptop, Chrome, scored with the scorer on `main`. 24 clean reads and 8 reads with one deliberate mistake each. Details: `fixtures/expected.json`. The second adult voice is still missing.

| Setup | Clean reads, mean accuracy | 3-star clean clips (of 24) | Median time per clip |
|---|---|---|---|
| base q8 (WASM) | 77% | 8 | 3.0 s |
| base q4 (WebGPU) | 72% | 7 | 1.2 s |
| base enc fp32 + dec q4 (WebGPU) | 76% | 10 | 1.5 s |
| **base fp16 (WebGPU)** | **79%** | **10** | **1.0 s** |
| Filipino int8 (own export), WASM | 93% | 19 | 11.1 s |
| Filipino int8 (own export), WebGPU | 92% | 19 | 24.4 s |

- **Scorer cut-offs.** An earlier note here recommended 0.75 / 0.45. That was wrong: at 0.75 the scorer's join and split check also loosened, so a skipped short word ("ay") was marked correct. Tested with the real scorer, the right choice is **0.80 / 0.50** with a separate `spacing` setting at 0.85 (PR #79, ADR-0011): clean reads 83% for both base q8 and base fp16, skipped words still missed, a wrong sentence earns a star 1% of the time.
- **Laptop precision.** q4 on WebGPU read worse than q8 (72% against 77%). fp16 on WebGPU is better than both (79%) and the fastest (1.0 s), at about the same download as q4 (139 MB against 136 MB). It needs the `shader-f16` GPU feature. PR #75 uses it for the laptop tier.
- **Skipped words** were marked "missed" in every setup. A repeated word and a hesitation are not penalised, by design.
- **A more accurate model lets the scorer separate good from bad reads better.** With the Filipino model, flawed reads score about 20 points below clean ones. With the base models the gap is only 10 to 12 points.
- One reader and 32 clips: treat these as a guide. The earlier first set of clips (old story text) scored the base models about 54%, much lower. The sets differ in sentences and mic distance, so do not compare them directly.

### Model notes for the team
- **The Filipino int8 model** (own Optimum export of `sapinsapin/whisper-small-fsc`, int8) downloads about **278 MB** (encoder 88 + merged decoder 186 + tokenizer and config 4). It sits in the public Hugging Face repo `acmrsu/kislap-whisper-small`. That repo still lacks `tokenizer.json`, `tokenizer_config.json`, `generation_config.json` and a model card, so the app cannot load it from there yet. The folder on disk is larger (636 MB) because it also holds two decoder files the app does not load.
- **Research-data warning.** This model was trained on the Filipino Speech Corpus, which is for research and non-commercial use only (`docs/validation.md` I8), and a model trained on it carries those terms. **It may not be viable for the App Builders Challenge.** Check the challenge rules before shipping it. If it ships, D8 and D11 must say so.
- **Can the model be swapped later?** Models are not part of our repo or deploy. The app downloads them from Hugging Face by repo id, and the id and precision per tier live in `src/asr/tier.ts`. Changing a model is a small edit and a redeploy, with no rebuild of the model. It is not swappable at runtime today (`?tier=` only picks between two fixed tiers). A swap needs the same Whisper layout (`encoder_model` and `decoder_model_merged`, 80 mel bins, no `cache_position` input). Every user downloads the new files again, and offline users do not get them until they reconnect. Pre-cache the demo devices.
- **Not done:** a faster export of the Filipino model (fp16 or a 4-bit decoder on WebGPU). It might keep the accuracy at a few seconds per sentence, but it would be about 390 MB, over the 300 MB target, and it has the research-data problem above.

## Open decisions (grill round 1 — see `docs/validation.md`)

- Q1–Q7 settled (see `docs/validation.md` grill log).

## Log
- **2026-10-10** — #13: Word Pop (`#/wordpop`) is a paper screen that listens. Practice words float as paper bubbles; the child taps the mic and says the word. The same mic, silence gate and Whisper worker as Reading check it, and a heard word at similarity 0.6 or more (`SCORING.wordPop`) pops the bubble with a sound. The second miss pops it anyway with a kind line (validation I25). Silence, an empty transcription, a mic error or a model error never count as a try; with no cached model a Skip button pops the bubble. Tapping a bubble shows its syllables once #21 splits them. Rules are a pure reducer in `src/game/wordPop.ts`. `?fake=1` makes the stub hear the current word, for demos.
- **2026-10-10 06:30** — D8 (#32, PR #81): README, `docs/submission.md` and `docs/assets.md` now say what ships after PR #75: whisper-base q8 on WebAssembly on every device. The fp16 WebGPU tier is listed only as a test option (`?tier=large`), not shipped by default.
- **2026-10-10 06:20** — #16 / PR #75, lead's safety pass after the freeze: the default tier is whisper-base **q8 on WebAssembly on every device**, the setup that passed the offline check. The fp16 WebGPU tier stays in the code but runs only with `?tier=large` (`GPU_BY_DEFAULT = false` in `src/asr/tier.ts`), because it has not run the full reading loop or the offline check on a real GPU. So a laptop that already cached q8 keeps Offline ready and downloads nothing new. The 64-token cap stays. A failed fallback no longer leaves a stale load behind.
- **2026-10-10 06:00** — #24 / PR #70: `docs/qa.md` updated to main. #68 marked fixed by #84; real routes, button labels and tier; spec §12 offline check, Network-tab rule and Privacy meter check for laptop and Poco X6 Pro. The meter cannot see model-worker requests (`meter.report()` has no caller), so the Network log is the proof.
- **2026-10-10 05:30** — 05:00 sweep: main healthy (348 tests, build green), production reading loop verified offline with the real model (8/8 sentences, sticker). #84 (progress recovery, #68) conflicted with main's language rule: fix PR into its branch keeps langChosen and logs every recovered field.
- **2026-10-10 02:20** — #45: Mic check (energy only, real recorder, room baseline, heard / noisy / denied / no mic) and a full Settings screen at `#/settings`, both on the paper scene with desktop layouts. `GameShell` skips its candy chrome for paper routes (`PAPER_ROUTES`) and re-reads settings on each screen change.
- **2026-10-10 01:45** — #11: the 12 stickers move to the part 2 paper look: a cream die-cut edge (half the handoff's width, per the team), printed lines in the cut line colour, every colour from the paper tokens, no dark outlines. Locked stickers are cream paper with a dashed cut line instead of a grey silhouette. Same art and mapping; 128 KB to about 35 KB without the provenance blocks.
- **2026-10-10 01:25** — #9: Ningning is the part 2 paper puppet in `src/ui/Ningning.tsx`: four wings turn on brass pins per mood, an optional puppet stick sways ±3°, the die-cut edge is half the handoff's. The v1 mood motion stays (idle bob, cheering and celebrating hops, encouraging lean, thought bubbles popping in); the halo screen-blends only on the paper sky. New app icon; the v1 mood SVGs are gone.
- **2026-10-10 01:10** — #8: Claude Design part 2 "paper puppet theatre" replaces the candy-adventure look, issue by issue. This PR: paper tokens, the kit redrawn as cut paper, `src/ui/PaperScene.tsx` (sky, hills, Gabi night) and `src/ui/Wordmark.tsx`. `adventure.css` stays until each screen moves; a paper scope in `tokens.css` keeps paper pieces on paper values meanwhile. Next: #9 Ningning, #11 stickers, then the screens (#10, #45, #12, #13), each with a desktop layout.
- **2026-10-10 01:09** — #16 / PR #75: the laptop tier is now whisper-base **fp16** on WebGPU, not q4. On the 24 clean golden clips: fp16 79% and 1.0 s median, q8 77% and 3.0 s, q4 72% and 1.2 s, encoder fp32 + decoder q4 76% and 1.5 s. fp16 downloads about 139 MB and needs the shader-f16 GPU feature, so a laptop without it uses the WebAssembly tier. One reader and 32 clips: a guide, not a result.
- **2026-10-10 00:52** — #16 / PR #75, after the lead's review: the GPU tier now falls back to WebAssembly when it fails on its first run, a warm-up, or mid-session (not only at load), and retries the request once. A network error is never blamed on the GPU and never saved. A late message from a replaced worker is ignored. The GPU probe times out after 3 s, and iPads and desktop-site mode count as phones. `/#/asrtest` shows the saved and active tier and can forget the saved one. **Before the demo:** a WebGPU laptop that already cached the q8 files must download the fp16 files (about 139 MB) once, so redo the offline check on it after deploy. _(Superseded at 06:20: the GPU tier is opt-in, so no laptop re-downloads.)_
- **2026-10-10** — @emyol fixed #68: loadProgress validates persisted fields separately and preserves valid rewards while recovering damaged containers, language, model tier and streak fields. Added regression coverage for the reported crashes and partial-data recovery; device QA in #24 remains pending.
- **2026-10-10** — Paper polish: the UI now opens in English (stories, sentences and story titles stay Filipino; the toggle still switches the UI). Back goes up to the parent screen (`goUp` in `src/ui/goBack.ts`), so Home, map, story, Back, Back lands on Home instead of the story. Home's bushes sit on the paper scene's hill line and stay put when the page scrolls; the Kislap sign hangs from a rope that runs off the top of the screen. Ningning's die-cut edge is thinner again (dilate 3).
- **2026-10-10** — #12: the firefly jar (`#/progress`) is a paper screen. Earned stickers float on their glow in the jar and the rest wait as cream paper outlines; tapping one shows it big with its name, and what earns it if it is still to come. Days of reading, a daily goal ring (2 stories a day, `src/game/dailyGoal.ts`, counted once per finish from Result) and stars per story sit below; desktop puts the jar on the left. Home marks the welcome back so the jar says it once.
- **2026-10-10** — #10: Home, Story map, Reading and Result move to the paper puppet look, each with a desktop layout at 900px and wider. Reading and Result split into a view (`ReadingView`, `ResultView`) and the lead's logic, unchanged. The map covers use the sticker art, Ningning waits by the next story, and Result now shows confetti and the sticker at 0 stars too, as in the design. The readiness badge is a paper slip. `AdventureMap` is gone.
- **2026-10-09** — @emyol prepared the #24 device evidence matrix and #37 claim-review notes in docs/qa.md. Reproduced malformed saved-progress failures on PR #52 and filed #68. Physical-device and final release checks remain pending.
- **2026-10-09 23:55** — D2 and D12 filled: team stochastic4 (Jhezra Tolentino, Ric Ian Barrios, Amiel Josiah Acuna, Marcus Ceasar Austria) and the AI tools (ChatGPT, Claude, Claude Code and skills, Claude Design, CodeRabbit). Members confirm spelling on #26.
- **2026-10-09 23:55** — Candy adventure design (Home, map, stickers, mic check, Word Pop) and a mobile-native shell for phones: bottom tabs, settings sheet, thumb-reach mic, haptics, theme-colour status bar. All its copy moved to i18n.
- **2026-10-09 23:50** — #16 (PR open, needs the lead's OK): model tiers. Laptop with WebGPU = whisper-base on WebGPU (q4 at first, 1.3 s per sentence in the benchmark; changed to fp16 in the next entry up). Phone, or no WebGPU = whisper-base q8 on WebAssembly. A phone never gets WebGPU (97 s on the one we tested). If the GPU model fails to load, the client starts a fresh worker with the WebAssembly tier and saves it in progress. The worker also caps output at 64 tokens, so a runaway repeat can no longer take 23 s. The Filipino small models are dropped (too slow and large; the internetoftim one crashes). D8 and the README models table must change to match.
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
