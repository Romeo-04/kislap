# Kislap ✨

**Basa. Kislap. Galing!** (Read. Sparkle. Great!)

Kislap is a free reading game for Filipino children in Grade 1 to 3. The child reads a short
story aloud, one sentence at a time. A speech model runs **in the browser, on the child's own
device**, and checks each word. Ningning the firefly reacts, and the child earns stars and
stickers. Missed words are saved for practice.

## Why Kislap

In April 2026 the World Bank reported that 91 percent of ten-year-olds in the Philippines cannot
read and understand a simple, age-appropriate text ([source](https://www.worldbank.org/en/news/press-release/2026/04/03/world-bank-backs-better-learning-for-21-million-filipino-students)).
Children learn to read by reading out loud to someone who listens, notices the word they stumbled
on, and helps them try again, and that listener is exactly what many Filipino children are
missing at home.

Imagine Lila, seven years old, in a barangay where the signal comes and goes. Her mother gets home
after dark, and when Lila reads aloud there is no one beside her, so the hard words simply stay
hard. With Kislap on the family phone, Ningning the firefly listens to each sentence. The word Lila
rushed glows orange, Ningning says "Subukan natin ulit!" and shows it in syllables, and she reads it
again, gets it, and earns a sticker. Nobody else hears her mistakes, nothing is sent anywhere, and
it all works with the data switched off.

Kislap gives every child a patient listener at any hour. It is kind by design, with no timers and
no word "wrong", and because the AI runs on the device it keeps a child's voice private and keeps
working where the signal is weakest.

## Features

- **Read aloud, sentence by sentence.** Three original stories (easy, medium, hard) in Filipino
  and Taglish.
- **Word marks.** Each word lights up green (correct), yellow (unclear), or orange (missed). The
  scoring is forgiving of child voices and Taglish.
- **Ningning the firefly.** A mascot that listens, thinks, cheers, and encourages. Its glow
  follows how well the child reads.
- **Stars and stickers.** 0 to 3 stars per story. Finishing a story always earns a sticker for
  the firefly jar.
- **Practice words.** Missed and unclear words are saved on the device; the Word Pop screen lists
  them to practise aloud.
- **Word help.** Tap a word after reading to see its syllables (pantig), such as "ba · ta". For
  a word that was not clear, Ningning says what it heard, and **Listen** reads the word slowly with
  a voice installed on the device (shown only when the phone has a Filipino-like voice).
- **Mic check.** Say "Kumusta, Ningning!" to test the microphone and the room before reading.
- **Daily streak.** It counts days played and never resets to zero.
- **Privacy meter.** An on-screen counter of the requests the reading screen makes while the child
  reads (the speech model's worker is not counted). It should read 0. The browser's network tab is
  the full check.
- **Filipino and English interface**, switchable at any time.
- **Works offline** after the first load.
- **Feels like a phone app.** Install it to the home screen: bottom tabs, a settings sheet, the mic
  in thumb reach, light vibration feedback, and a status bar that follows day and night mode.

**Not in this build yet:** Word Pop listening to each word, echo reading
in a teammate's voice, a progress QR code for parents, and a Filipino fine-tuned model on laptops.

## Privacy and local AI

**What runs on the device:** speech recognition, word scoring, game logic, progress storage,
mascot, and sounds. No audio and no text leaves the device.

**What needs internet:** only the first load of the app and the first download of the speech
model. After that, Kislap works with Wi-Fi off.

There is no account, no server, no analytics, and no cloud AI. Progress stays in the browser on
the device.

### Why does this product benefit from running AI locally?

A child's voice is sensitive data. Kislap processes it on the device, and it never goes to a
server. After the first download, the app works with no internet, in places with weak signal.
Anyone can check this: open the browser's network tab (the full check), or look at the Privacy
meter, while a child reads.

## How it works

1. The microphone records one sentence. Recording stops on a tap or after a short silence.
2. A loudness check skips clips that are only silence.
3. A Whisper model, running in a Web Worker through Transformers.js on WebAssembly, writes down what
   it heard.
4. The scorer aligns the heard words with the story words and marks each one.
5. Ningning reacts, and stars, stickers, and practice words are saved on the device.

| Device | Speech model |
|---|---|
| Every device (laptop and phone) | `onnx-community/whisper-base`, **q8**, on WebAssembly (about 73 MB), `language: tagalog` |

A WebGPU option (the same model in fp16, about 139 MB) exists for testing only. It runs only when
`?tier=large` is in the URL, and it is off by default because it has not passed the full reading loop
and the offline check on a real GPU. If it fails, the app switches to the WebAssembly model on its own.

Filipino fine-tunes were tested but are not used. `internetoftim/whisper-small-pld-fil-ONNX` does not run in the current Transformers.js version. Our own int8 export of `sapinsapin/whisper-small-fsc` (a public backup repo, `acmrsu/kislap-whisper-small`) runs, but it takes 11 s or more per sentence on a laptop and is about 278 MB. It was trained on research-use data (Filipino Speech Corpus), so it may not be viable for the App Builders Challenge, and it is not shipped.

## Tech stack

Vite · TypeScript · React · Transformers.js (`@huggingface/transformers`) · ONNX Runtime Web ·
WebAssembly (WebGPU only with the `?tier=large` test switch, off by default) · vite-plugin-pwa (Workbox) · Vitest · Vercel (static hosting).

## Getting started

Requires Node.js 20 or later.

```bash
npm install
npm run dev        # http://localhost:5173 (the microphone works on localhost)
npm test           # unit tests
npm run build      # production build in dist/
```

The microphone needs HTTPS on any host other than localhost.

## Project structure

```
src/
  app/        screens
  ui/         shared components
  asr/        microphone, silence check, speech model worker
  scoring/    word alignment and scoring
  game/       session, mascot, progress
  content/    stories and syllables
  i18n/       Filipino and English text
  privacy/    privacy meter
docs/
  architecture.md   architecture and module contracts
  adr/              architecture decision records
  uml/              UML diagrams
```

## Disclosures

**Team stochastic4**

| Member | Role | GitHub |
|---|---|---|
| Jhezra Tolentino | Lead: app shell, integration, offline, deploy | @Romeo-04 |
| Ric Ian Barrios | Design: screens, Ningning, art, demo video | @Seedlign |
| Amiel Josiah Acuna | Speech model on the device | @acmrsu |
| Marcus Ceasar Austria | Content, scoring, and QA | @emyol |

Built during the AppBuildersPH Hackathon 2026 (Oct 9–10). No code from earlier projects.

### Where each AI function runs

| Function | Where it runs | Needs internet? |
|---|---|---|
| Speech recognition (Whisper) | In the browser, in a Web Worker (Transformers.js + ONNX Runtime Web, WebAssembly) | Only to download the model once |
| Silence check | In the browser (loudness of the recording) | No |
| Word scoring and word marks | In the browser (word alignment with spelling similarity) | No |
| Mascot, stars, stickers, Word Pop, sounds | In the browser | No |
| Progress (stars, stickers, streak, practice words) | Browser `localStorage` on the device | No |

No audio, transcript, or progress is sent anywhere. There is no server, account, analytics, or
cloud AI.

### Models

| Model | Used on | Licence and data |
|---|---|---|
| Whisper base (OpenAI), ONNX export `onnx-community/whisper-base`, q8 (~73 MB), on WebAssembly | Every device | Apache-2.0 (`openai/whisper-base` card); the ONNX export card states no licence |

Tested but not shipped:

- The same `onnx-community/whisper-base` export in fp16 (~139 MB) on WebGPU. It is in the code as a test option (`?tier=large`) and is never picked by default.

- `internetoftim/whisper-small-pld-fil-ONNX`, a Filipino fine-tune (model cards MIT and Apache-2.0; its UP-DSP PLD training data is for research and non-commercial use).
- Our own int8 export of `sapinsapin/whisper-small-fsc` (about 278 MB; trained on the Filipino Speech Corpus, which is for research and non-commercial use; it may not be viable for the App Builders Challenge).

The models are downloaded from Hugging Face at run time. They are not part of this repository.

### Services

| Service | Used for |
|---|---|
| Vercel | Static hosting of the app (HTTPS). No server functions, no analytics. |
| Hugging Face Hub (including its file CDN) | Model files, downloaded once |
| GitHub | Source code |

**No AI API and no cloud inference.**

### Technologies

Vite 8 · TypeScript 6 · React 19 · Transformers.js 4.3 (`@huggingface/transformers`) · ONNX Runtime
Web 1.31 (dev build, via Transformers.js) · WebAssembly (WebGPU only with the `?tier=large` test switch, off by default) · vite-plugin-pwa 2 (Workbox 7) ·
Vitest 5 · oxlint. Full list with versions and licences: `docs/assets.md`.

### Existing assets

Fonts (Baloo 2, Andika; SIL Open Font License, self-hosted), libraries, and every other item we
did not make are listed with source and licence in `docs/assets.md`. The mascot, stories,
stickers, and sounds were made during the event.

### AI development tools

| Tool | Used for |
|---|---|
| ChatGPT (OpenAI) | Brainstorming |
| Claude (Anthropic) | Brainstorming |
| Claude Code (Anthropic) | Spec validation, architecture and ADRs, issue planning, code, tests, and PR reviews |
| Claude Code skills | Engineering and implementation practices: test-driven development, design (impeccable), PR review (pr-review-toolkit), planning and domain modelling |
| Claude Design (Anthropic) | Visual design handoff: tokens, UI kit, mascot and sticker art |
| CodeRabbit | Automated PR summaries on GitHub |

## Licence

The code in this repository is MIT licensed (`LICENSE`). The speech models are not included and
keep their own licences and data terms (see Models above).
