# Kislap — progress

Update this file in the same PR as the work. Newest notes on top in the log. Times are Asia/Manila.
Issues: https://github.com/Romeo-04/kislap/issues · Tracker: #40

## Now

- **Phase:** Parallel build (15:00–19:00). Next gate: **Checkpoint 1 at 19:00**.
- **Deployed URL:** _not yet (#1)_
- **Speech model in use:** _none yet_ → bootstrap `onnx-community/whisper-base` q8 (#14)

## Checkpoints

| Gate | Time | Must be true | Status |
|---|---|---|---|
| Checkpoint 1 | 19:00 Oct 9 | Model transcribes a real recording in the browser (laptop + phone). UI works with fake data. Scorer tests pass. | ⏳ |
| Checkpoint 2 | 00:00 Oct 10 | Full Must loop works end to end | ⏳ |
| Feature freeze | 01:00 Oct 10 | Offline check passes on laptop + Poco X6 Pro. Bug fixes only after this. | ⏳ |
| Submission | 08:30 Oct 10 (hard 10:00) | Form submitted, X + LinkedIn posts up | ⏳ |
| Demo Day | 13:00–19:00 Oct 10 | Live pitch at Cyberzone SM Makati | ⏳ |

## Owners and tasks

Each person has one epic. Ticking an atomic issue = closing it. Legend: ⏳ open · 🔨 in progress · ✅ done.

### Lead — epic #41

| # | Task | Gate | Status |
|---|---|---|---|
| #1 | Scaffold Vite + React + TS PWA, deploy to Vercel | CP1 | ⏳ |
| #2 | Audio recorder, level meter, silence gate, auto-stop | CP1 | ⏳ |
| #3 | Reading loop integration | CP2 | ⏳ |
| #4 | On-device progress | CP2 | ⏳ |
| #5 | Offline ready | Freeze | ⏳ |
| #6 | Privacy meter (Should) | Freeze | ⏳ |
| #7 | Demo Day kit | Demo | ⏳ |
| D1 #25, D2 #26, D3 #27, D5 #29, D9 #33, D10 #34, D12 #36, D13 #37, D15 #39 | Deliverables | — | ⏳ |

### Designer — epic #42

| # | Task | Gate | Status |
|---|---|---|---|
| #8 | Design tokens and UI kit | CP1 | ⏳ |
| #9 | Ningning SVG, 6 moods, glow | CP1 | ⏳ |
| #10 | Core screens: Home, Story map, Reading, Result | CP1 | ⏳ |
| #11 | Sounds and Sticker art | CP2 | ⏳ |
| #12 | Sticker jar + progress screen (Should) | Freeze | ⏳ |
| #13 | Word Pop (Should) | Freeze | ⏳ |
| D4 #28, D11 #35 | Deliverables | — | ⏳ |

### Model engineer — epic #43

| # | Task | Gate | Status |
|---|---|---|---|
| #14 | ASR worker with bootstrap Whisper-base | CP1 | ⏳ |
| #15 | Device benchmark: laptop + Poco X6 Pro | CP1 | ⏳ |
| #16 | Model tiers (Filipino small on laptop, base on phone) | CP2 | ⏳ |
| #17 | Stretch: export whisper-small-fsc q4f16 (stop 22:00) | CP2 | ⏳ |
| #18 | Golden recordings + eval script | CP2 | ⏳ |
| D6 #30, D7 #31, D8 #32 | Deliverables | — | ⏳ |

### Content, scoring & QA — epic #44

| # | Task | Gate | Status |
|---|---|---|---|
| #19 | Three original stories | CP1 | ⏳ |
| #20 | Forgiving scorer + ≥ 10 tests | CP1 | ⏳ |
| #21 | Syllable help (pantig) (Should) | Freeze | ⏳ |
| #22 | i18n copy fil + en | CP2 | ⏳ |
| #23 | Tune scoring on golden recordings | Freeze | ⏳ |
| #24 | Device QA, offline + network checks | Freeze | ⏳ |
| D14 #38 | Deliverable | — | ⏳ |

## Measurements (fill at Checkpoint 1)

| Device | Tier / model / dtype | Backend | Download MB | Load s | 4 s sentence s | Notes |
|---|---|---|---|---|---|---|
| Laptop (Chrome) | | | | | | |
| Poco X6 Pro (Chrome) | | | | | | |

## Open decisions (grill round 1 — see `docs/validation.md`)

- Q1 Large-tier model · Q2 X + LinkedIn posting · Q3 Demo Day plan · Q4 Under-50 % reward ·
  Q5 Creative additions · Q6 Eden review tonight · Q7 GitHub usernames

## Log

- **2026-10-09 16:40** — Repo bootstrapped: spec validated (`docs/validation.md`), architecture,
  9 ADRs, 7 UML diagrams, glossary. 5 milestones, 44 issues (24 tasks, 15 deliverables,
  tracker, 4 epics with sub-issues).
