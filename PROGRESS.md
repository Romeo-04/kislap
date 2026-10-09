# Kislap — progress

Update this file in the same PR as the work. Newest notes on top in the log. Times are Asia/Manila.
Issues: https://github.com/Romeo-04/kislap/issues · Tracker: #40

## Now

- **Phase:** Parallel build (15:00–19:00). Next gate: **Checkpoint 1 at 19:00**.
- **Deployed URL:** https://kislap.vercel.app (device check: https://kislap.vercel.app/#/mictest)
- **Speech model in use:** _none yet_ → bootstrap `onnx-community/whisper-base` q8 (#14); laptop target `internetoftim/whisper-small-pld-fil-ONNX` (#16, Q1 = A)
- **Flutter spike:** closed, not run (#48). Web app stays (ADR-0002).
- **Visual design:** Claude Design handoff in `docs/design/claude-design-handoff.md` (brief: `docs/design-handoff.md`).

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

### Lead (@Romeo-04) — epic #41

| # | Task | Gate | Status |
|---|---|---|---|
| #1 | Scaffold Vite + React + TS PWA, deploy to Vercel | CP1 | 🔨 PR open; phone mic check left |
| #2 | Audio recorder, level meter, silence gate, auto-stop | CP1 | ⏳ |
| #3 | Reading loop integration | CP2 | ⏳ |
| #4 | On-device progress | CP2 | ⏳ |
| #5 | Offline ready | Freeze | ⏳ |
| #6 | Privacy meter (Should) | Freeze | ⏳ |
| #7 | Demo Day kit | Demo | ⏳ |
| D1 #25, D2 #26, D3 #27, D5 #29, D9 #33, D10 #34, D12 #36, D13 #37, D15 #39 | Deliverables | — | ⏳ |

### Designer (@Seedlign) — epic #42

| # | Task | Gate | Status |
|---|---|---|---|
| #8 | Design tokens and UI kit | CP1 | 🔨 PR open (Claude Design tokens, Baloo 2 + Andika, kit in `src/ui/`) |
| #9 | Ningning SVG, 6 moods, glow | CP1 | ⏳ |
| #10 | Core screens: Home, Story map, Reading, Result | CP1 | ⏳ |
| #11 | Sounds and Sticker art | CP2 | ⏳ |
| #12 | Sticker jar + progress screen (Should) | Freeze | ⏳ |
| #13 | Word Pop (Should) | Freeze | ⏳ |
| #45 | Mic-check screen (Should) | Freeze | ⏳ |
| #48 | Flutter spike (45 min, decide by 17:00) | 17:00 | ⏳ |
| D4 #28, D11 #35 | Deliverables | — | ⏳ |

### Model engineer (@acmrsu) — epic #43

| # | Task | Gate | Status |
|---|---|---|---|
| #14 | ASR worker with bootstrap Whisper-base | CP1 | ⏳ |
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
| #20 | Forgiving scorer + ≥ 10 tests | CP1 | ⏳ |
| #21 | Syllable help (pantig) (Should) | Freeze | ⏳ |
| #22 | i18n copy fil + en | CP2 | ⏳ |
| #23 | Tune scoring on golden recordings | Freeze | ⏳ |
| #24 | Device QA, offline + network checks | Freeze | ⏳ |
| #46 | Echo reading with teammate audio (Should) | Freeze | ⏳ |
| D14 #38 | Deliverable | — | ⏳ |

## Measurements (fill at Checkpoint 1)

| Device | Tier / model / dtype | Backend | Download MB | Load s | 4 s sentence s | Notes |
|---|---|---|---|---|---|---|
| Laptop (Chrome) | | | | | | |
| Poco X6 Pro (Chrome) | | | | | | |

## Open decisions (grill round 1 — see `docs/validation.md`)

- Q1–Q7 settled (see `docs/validation.md` grill log).
- Flutter spike (#48): decide at 17:00 / Checkpoint 1.

## Log

- **2026-10-09 21:27** — #19 / PR #53: revised the stories for a clearer reading progression. The easy story uses short, familiar words and a complete cat-and-firefly plot; the medium story has a garden problem and resolution; the hard story uses longer clauses and Taglish. Each has eight sentences of four to ten words. Content checks, the existing test, typecheck, and build pass. Awaiting teammate review.
- **2026-10-09 19:05** — #8: Claude Design tokens (`src/styles/tokens.css`), self-hosted Baloo 2 + Andika, all handoff copy in i18n, UI kit in `src/ui/`. Placeholder screens keep working through a legacy block in `base.css` until #10.
- **2026-10-09 17:53** — #19 / PR #53: applied the three grammar corrections from review (Dumapo, Sabay silang umuwi, Dahan-dahan) and added quotation marks to Ben's dialogue. Story IDs, levels, and sentence counts are unchanged. Awaiting teammate approval.
- **2026-10-09 17:37** — #19: replaced the scaffold stories with three original stories in Ningning's world. Eight sentences each, four to ten words per sentence, bilingual titles, and stable story IDs. Content checks, the existing test, build, and lint pass. Awaiting teammate review.
- **2026-10-09 16:30** — @Seedlign accepted the invite; all designer issues (#8–#13, #28, #35, #42, #45, #48) assigned.
- **2026-10-09 16:20** — Scaffold up (#1): contract stubs for every module, fake reading loop works, live on Vercel. Every owner can branch from `main` once the PR merges.
- **2026-10-09 16:05** — Q7: issues assigned by role (designer pending invite).
- **2026-10-09 15:55** — Grill round 1 settled Q1–Q6: Filipino ONNX on laptop, all six creative additions (#45–#47 new), sticker on every finish (ADR-0010), Eden removed (ADR-0009 accepted). Flutter spike delegated (#48).
- **2026-10-09 15:45** — Repo bootstrapped: spec validated (`docs/validation.md`), architecture,
  9 ADRs, 7 UML diagrams, glossary. 5 milestones, 44 issues (24 tasks, 15 deliverables,
  tracker, 4 epics with sub-issues).
