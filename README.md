# Kislap ✨

**Basa. Kislap. Galing!** (Read. Sparkle. Great!)

Kislap is a free reading game for Filipino children in Grade 1 to 3. The child reads a short
story aloud, one sentence at a time. A speech model runs **in the browser, on the child's own
device**, and checks each word. Ningning the firefly reacts, and the child earns stars and
stickers. Missed words come back in a short practice game.

**Try it:** https://kislap.vercel.app (Chrome on a laptop or an Android phone)

## Features

- **Read aloud, sentence by sentence.** Three original stories (easy, medium, hard) in Filipino
  and Taglish.
- **Word marks.** Each word lights up green (correct), yellow (unclear), or orange (missed). The
  scoring is forgiving of child voices and Taglish.
- **Ningning the firefly.** A mascot that listens, thinks, cheers, and encourages. Its glow
  follows how well the child reads.
- **Stars and stickers.** 0 to 3 stars per story. Finishing a story always earns a sticker for
  the firefly jar.
- **Word Pop.** Missed words float as bubbles; say a word to pop it.
- **Syllable help.** Tap a word to see it split into syllables, such as "ba-ta".
- **Echo reading.** Hear a sentence read aloud first, then read it yourself.
- **Mic check.** Say "Kumusta, Ningning!" to test the microphone before reading.
- **Daily streak.** It counts days played and never resets to zero.
- **Progress QR.** Show a child's progress to a parent or teacher as a QR code, with no server.
- **Privacy meter.** An on-screen counter shows that 0 network requests leave the device
  while the child reads.
- **Filipino and English interface**, switchable at any time.
- **Works offline** after the first load.
- **Feels like a phone app.** Install it to the home screen: bottom tabs, a settings sheet, the mic
  in thumb reach, light vibration feedback, and a status bar that follows day and night mode.

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
Anyone can check this: open the browser's network tab, or look at the Privacy meter, while a
child reads.

## How it works

1. The microphone records one sentence. Recording stops on a tap or after a short silence.
2. A loudness check skips clips that are only silence.
3. A Whisper model, running in a Web Worker through Transformers.js (WebGPU, or WebAssembly as a
   fallback), writes down what it heard.
4. The scorer aligns the heard words with the story words and marks each one.
5. Ningning reacts, and stars, stickers, and practice words are saved on the device.

| Device | Speech model |
|---|---|
| Laptop with WebGPU | `internetoftim/whisper-small-pld-fil-ONNX` (Filipino fine-tune) |
| Phone, or no WebGPU | `onnx-community/whisper-base` |

## Tech stack

Vite · TypeScript · React · Transformers.js (`@huggingface/transformers`) · ONNX Runtime Web ·
WebGPU / WebAssembly · vite-plugin-pwa (Workbox) · Vitest · Vercel (static hosting).

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

## Models, data, and credits

- **Whisper** (OpenAI), through ONNX exports from `onnx-community`.
- **`internetoftim/whisper-small-pld-fil-ONNX`**, an export of `sapinsapin/whisper-small-pld-fil`.
  Its training data (UP-DSP PLD) is for research and non-commercial use. Kislap is free and
  non-commercial.
- Mascot, stories, and art are original. Sounds and fonts are listed with their licences in
  `docs/assets.md`.

Built for the AppBuildersPH Hackathon 2026.
