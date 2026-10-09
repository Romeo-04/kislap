# Kislap architecture

Read with `CONTEXT.md` (words), `docs/adr/` (why), and `docs/uml/` (diagrams). This file is the
contract the four owners build against in parallel. If you change a contract, change it here in
the same PR and tell the owners of the modules on both sides.

## 1. Shape in one paragraph

Kislap is a static PWA (ADR-0002) with **no backend** (ADR-0001). The UI thread runs React
screens, the game logic, and the scorer. A **Web Worker** owns the Speech model (Whisper through
Transformers.js) and is the only code that touches ONNX Runtime (ADR-0004). Audio is captured on
the UI thread, gated for silence (ADR-0006), resampled to 16 kHz mono, and sent to the worker as a
transferable `Float32Array`. The Heard text comes back, the forgiving scorer (ADR-0005) makes Word
marks, and the game layer turns those into Mascot moods, Stars, Stickers, and Practice words saved
in localStorage (ADR-0008). Nothing leaves the device during reading, and the Privacy meter proves
it (ADR-0007).

Diagrams: [component](uml/component.md) · [class](uml/class.md) ·
[sequence](uml/sequence.md) · [state](uml/state.md) · [activity](uml/activity.md) ·
[deployment](uml/deployment.md) · [use case](uml/use-case.md)

## 2. Layers and ownership

| Layer | Folder | Owner | Depends on |
|---|---|---|---|
| Screens and UI kit | `src/app/`, `src/ui/` | Designer | game, i18n, (asr via hooks) |
| App shell, routing, PWA, deploy, offline | `src/main.tsx`, `src/app/router.tsx`, `src/pwa/`, `vite.config.ts`, `vercel.json` | Lead | everything |
| Audio capture and silence gate | `src/asr/audio.ts`, `src/asr/meter.ts` | Lead | Web Audio |
| Speech model | `src/asr/worker.ts`, `src/asr/transcribe.ts`, `src/asr/tier.ts` | Model engineer | Transformers.js |
| Scoring | `src/scoring/*` | Content-QA | nothing (pure functions) |
| Game state | `src/game/progress.ts`, `src/game/mascot.ts`, `src/game/session.ts` | Lead (session), Designer (mascot), Content-QA (progress tests) | scoring |
| Content | `src/content/stories.json`, `src/content/syllables.ts` | Content-QA | nothing |
| i18n | `src/i18n/fil.json`, `src/i18n/en.json`, `src/i18n/index.ts` | Designer (keys), Content-QA (copy) | nothing |
| Privacy meter | `src/privacy/meter.ts` | Lead | Resource Timing API |
| Mic check | `src/app/MicCheck.tsx` | Designer | asr/audio (energy only, no model) |
| Echo reading audio | `public/audio/`, `audio` field in `stories.json` | Content-QA | nothing |
| Progress QR | `src/app/ProgressShare.tsx` | Model engineer | game/progress, bundled QR library |

**Rule:** `scoring/` and `content/` import nothing from React or the browser. Content-QA can test
them in Node with Vitest alone.

## 3. Module contracts

These extend spec §6. Each file starts as a stub with fake data, so every owner can build on day
one (fake first, real later).

```ts
// ---------- src/asr/audio.ts (Lead) ----------
export interface Recorder {
  start(): Promise<void>;                 // asks for the mic once, then reuses the stream
  stop(): Promise<Float32Array>;          // 16 kHz mono PCM
  onLevel(cb: (rms: number) => void): () => void;  // drives the mic glow
  onAutoStop(cb: () => void): () => void;           // 1.5 s quiet after speech, or 15 s max → call stop()
  release(): void;                                  // free the mic when leaving the screen
}
export function createRecorder(opts?: { autoStopSilenceMs?: number /* 1500 */; maxMs?: number /* 15000 */ }): Recorder;
// throws MicError { kind: 'denied' | 'unavailable' } from start()

// ---------- src/asr/meter.ts (Lead) ----------
export function rms(pcm: Float32Array): number;
export function isMostlySilence(pcm: Float32Array, threshold?: number): boolean;  // ADR-0006
export function createSilenceDetector(o: { threshold: number; silenceMs: number; maxMs: number }): { push(level: number, tMs: number): 'continue' | 'stop' };
// src/asr/resample.ts: resample(pcm, fromRate, toRate), concatChunks(chunks)

// ---------- src/asr/tier.ts (Model) ----------
export type ModelTier = 'large' | 'small';
export interface TierInfo { tier: ModelTier; modelId: string; device: 'webgpu' | 'wasm'; approxMB: number }
export function pickTier(): Promise<TierInfo>;   // URL ?tier= override > saved > WebGPU probe

// ---------- src/asr/transcribe.ts (Model) — main-thread API to the worker ----------
export interface TranscribeResult {
  text: string;
  ms: number;                                    // inference time, for the debug panel
  words?: { word: string; start: number; end: number }[];  // only if timestamps work
}
export function loadModel(onProgress?: (p: { loaded: number; total: number; file: string }) => void): Promise<TierInfo>;
export function transcribe(audio: Float32Array): Promise<TranscribeResult>;
export function isModelCached(): Promise<boolean>;
export function warmUp(): Promise<void>;         // one silent inference so the first real one is fast

// Worker messages (src/asr/worker.ts)
type ToWorker =
  | { type: 'load'; tier: TierInfo }
  | { type: 'transcribe'; id: number; audio: Float32Array }   // transfer audio.buffer
  | { type: 'warmup' };
type FromWorker =
  | { type: 'progress'; loaded: number; total: number; file: string }
  | { type: 'ready'; tier: TierInfo }
  | { type: 'result'; id: number; text: string; ms: number }
  | { type: 'error'; id?: number; message: string };

// ---------- src/scoring/* (Content-QA) — pure ----------
export type WordStatus = 'correct' | 'unclear' | 'missed';
export interface WordResult { word: string; status: WordStatus; heard?: string; similarity: number }
export function normalize(text: string): string[];                 // normalize.ts
export function similarity(a: string, b: string): number;          // align.ts, 0..1
export function align(expected: string[], heard: string[]): Array<[number | null, number | null]>;
export function scoreReading(expectedText: string, heardText: string): { words: WordResult[]; accuracy: number };
export function starsFor(accuracy: number): 0 | 1 | 2 | 3;         // stars.ts
export const SCORING = { correct: 0.85, unclear: 0.6, stars: [0.5, 0.7, 0.9] } as const;  // config.ts

// ---------- src/content/syllables.ts (Content-QA) — "pantig" help ----------
export function syllabify(word: string): string[];   // "bata" -> ["ba","ta"], "ngipin" -> ["ngi","pin"]

// ---------- src/game/session.ts (Lead) ----------
export interface SentenceAttempt { sentenceIndex: number; heard: string; words: WordResult[]; accuracy: number }
export interface ReadingSession {
  storyId: string;
  attempts: SentenceAttempt[];        // best attempt per sentence counts
  accuracy(): number;                 // mean over sentences of the best attempt
  practiceWords(): string[];          // missed + unclear
}

// ---------- src/game/mascot.ts (Designer) ----------
export type MascotMood = 'idle' | 'listening' | 'thinking' | 'cheering' | 'encouraging' | 'celebrating';
export function moodFor(event: 'mic-on' | 'mic-off' | 'scored' | 'silence' | 'story-done', accuracy?: number): MascotMood;
export function glowFor(accuracy: number): number;   // 0..1, Ningning's brightness

// ---------- src/game/progress.ts (Lead; tests by Content-QA) ----------
export interface Progress {
  version: 1;
  lang: 'fil' | 'en';
  tier?: ModelTier;
  stars: Record<string /* storyId */, 0 | 1 | 2 | 3>;
  stickers: string[];
  practiceWords: string[];
  streak: { days: number; lastPlayed: string /* YYYY-MM-DD local */ };
}
export function loadProgress(): Progress;     // key 'kislap.progress.v1', safe defaults on bad JSON
export function saveProgress(p: Progress): void;
export function recordStory(p: Progress, storyId: string, stars: 0|1|2|3): { progress: Progress; newSticker?: string };
export function touchStreak(p: Progress, today: string): { progress: Progress; welcomeBack: boolean };
export function addPracticeWords(p: Progress, words: string[]): Progress;   // normalized, deduped, newest 20
export function localDate(d?: Date): string;   // local YYYY-MM-DD; the one "today" helper for streak and goals
export function defaultProgress(): Progress;
// recordStory: sticker-<storyId> on every first finish (ADR-0010), sticker-<storyId>-gold at 3 stars.
// saveProgress never throws (logs on quota or blocked storage).

// ---------- src/privacy/meter.ts (Lead) ----------
export function summarize(entries: { name: string; transferSize: number }[], origin: string): { requests: number; bytes: number; urls: string[] };
export function startPrivacyMeter(): { snapshot(): PrivacySummary; onChange(cb): () => void; report(entry): void; stop(): void };
// Counts requests, not "bytes sent": Resource Timing has no sent size. Worker requests must be report()-ed.
```

## 4. Key runtime flows

- **First load**: shell from Vercel → service worker precaches shell, fonts, sounds, art →
  `pickTier()` → `loadModel()` with a progress bar ("Inihahanda ang Kislap…") →
  `storage.persist()` → `warmUp()` → **Offline ready** badge. See [activity](uml/activity.md).
- **Read a Sentence**: mic → level meter → stop (tap or 1.5 s silence) → silence gate →
  worker transcribe → `scoreReading` → word-by-word reveal + Mascot mood → next or retry. See
  [sequence](uml/sequence.md).
- **Finish a Story**: session accuracy → `starsFor` → `recordStory` → Sticker → confetti →
  Practice words saved for Word Pop.

## 5. Non-functional targets

| Target | Laptop (Chrome, WebGPU) | Poco X6 Pro (Chrome Android) |
|---|---|---|
| Model download (first load) | ≤ 300 MB | ≤ 150 MB (small tier) |
| Transcribe a 4 s Sentence | ≤ 2 s | ≤ 4 s |
| UI frame drops during inference | none (worker) | none (worker) |
| Network bytes during a Reading session | 0 | 0 |
| Touch targets / story font | ≥ 48 px / ≥ 28 px | same |

Numbers are targets until Checkpoint 1 measures them. Record real numbers in `PROGRESS.md`.

## 6. Folder layout

```
kislap/
  CLAUDE.md  CONTEXT.md  PROGRESS.md  README.md  kislap-spec.md
  .claude/skills/git-operations/SKILL.md
  docs/  architecture.md  validation.md  adr/  uml/
  public/  manifest.webmanifest  icons/  sounds/  fonts/  mascot/
  src/
    main.tsx
    app/        Home, StoryMap, Reading, Result, WordPop, Progress, MicCheck, router.tsx
    ui/         Button, WordChip, StarRow, Confetti, OfflineBadge, PrivacyMeter, LangToggle
    asr/        audio.ts meter.ts tier.ts transcribe.ts worker.ts
    scoring/    normalize.ts align.ts score.ts stars.ts config.ts *.test.ts
    game/       session.ts mascot.ts progress.ts *.test.ts
    content/    stories.json syllables.ts syllables.test.ts
    i18n/       fil.json en.json index.ts
    privacy/    meter.ts
    pwa/        register.ts
  scripts/      convert-model.md bench.html
```
