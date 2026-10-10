# Submission answers (draft)

Copy these into the form. **Before 08:00:** check D1 and the README feature list against what is merged (Word Pop, echo reading, and the progress QR may not ship). Each section maps to a deliverable issue (D1–D13). Text marked
**[confirm]** must be checked against the final build before 08:00. The final versions also go
into `README.md` where the README already has that section.

## D1 Project name and short description

**Kislap** (mascot: Ningning the firefly)

**The problem.** In April 2026 the World Bank reported that 91 percent of ten-year-olds in the
Philippines cannot read and understand a simple, age-appropriate text [1]. Behind that number are
millions of children who are bright, curious, and willing, but who never got enough practice at the
moment it matters most. Children learn to read by reading out loud, again and again, to someone who
listens, notices the word they stumbled on, and gently helps them try it once more. That listener
is exactly what many Filipino children are missing. Parents often work long hours and come home
tired, teachers with large classes cannot hear every child read, and many reading apps need a
steady connection or an account, or simply do not offer stories in Filipino. For a family that
watches every peso of mobile data, that is often enough to make practice stop.

**A story.** Imagine Lila, a seven-year-old in a barangay where the mobile signal comes and goes.
Her mother sells vegetables at the market and gets home after dark, and by then the house is busy
with dinner and chores. Lila likes the picture books her teacher sends home, but when she reads
aloud there is no one beside her, so the hard words simply stay hard. One evening her mother opens
Kislap on the family phone. A little firefly named Ningning asks Lila to read the first sentence of
a story about a cat and a firefly in the dark. As she reads, the words light up one by one; most of
them glow green, and one word she rushed glows orange. Ningning does not scold her. It says
"Subukan natin ulit!", shows the word split into syllables, and waits. Lila reads it again,
slowly, gets it right, and earns a sticker for her jar. Nobody else hears her mistakes, nothing she
says is sent anywhere, and all of it works with the phone's data switched off.

**What Kislap is.** Kislap is a free reading game for Filipino children in Grades 1 to 3. A child
reads a short Filipino or Taglish story aloud, one sentence at a time, while a speech model runs
inside the browser on the child's own device and marks each word as correct, unclear, or missed.
Ningning reacts to every sentence, the child earns stars and stickers, tapping a word shows how it
breaks into syllables, and the words that were hard are saved for practice. There is no account and
no server, and after the first download the whole experience works without the internet.

**Why it would work.** Reading improves with practice, and practice improves when someone listens.
Kislap gives every child that patient listener at any hour of the day, without waiting for an adult
to be free. It is kind by design: there are no timers, no lives, and no word "wrong", and finishing
a story always earns a sticker, so a child who struggles still wants to come back tomorrow. Because
the speech recognition runs on the device itself, a child's voice stays private, and the app keeps
working in the places where the signal is weakest, which are often the places where children need
the most help.

**Sources**

1. World Bank, "World Bank Backs Better Learning for 21 Million Filipino Students," press release,
   3 April 2026. https://www.worldbank.org/en/news/press-release/2026/04/03/world-bank-backs-better-learning-for-21-million-filipino-students
2. Kislap's own measurements on the demo devices: `PROGRESS.md` (Measurements) and the
   validation notes in `docs/validation.md`.

## D2 Team members

**Team name: stochastic4**

| Name | Role | GitHub |
|---|---|---|
| Jhezra Tolentino | Lead: app shell, integration, offline, deploy | @Romeo-04 |
| Ric Ian Barrios | Designer: screens, Ningning, art, demo video | @Seedlign |
| Amiel Josiah Acuna | Model engineer: on-device speech model | @acmrsu |
| Marcus Ceasar Austria | Content, scoring, and QA | @emyol |

## D3 Public GitHub repository

https://github.com/Romeo-04/kislap · Live app: https://romeo-04.github.io/kislap/ (mirror:
https://kislap.vercel.app)

## D4 / D5 Demo video and posts

- Video file: **[link after recording]**
- Reading in the demo video: the sentence reads that the app scores on screen were recorded by
  **Marcus Ceasar Austria** (content, scoring and QA). They were played into the browser's
  microphone input, and the word marks shown are the real on-device model's output. His voice is
  not heard in the video.
- X post (tags @cognition and Devin): **[URL]**
- LinkedIn post (tags @cognition and Devin): **[URL]**

### Post text for X (≤ 280 characters with the link)

> Kislap ✨ a Filipino-first reading game. A child reads aloud, and Whisper runs on the device
> to mark each word. No account, no upload, works offline. Built at #AppBuildersPH by stochastic4
> @cognition @DevinAI
> https://romeo-04.github.io/kislap/

**[confirm the X handles: the event page says "tag @cognition and Devin"; check Devin's exact
handle before posting]**

### Post text for LinkedIn

> We built **Kislap** ✨ at the AppBuildersPH Hackathon 2026: a free reading game for Filipino
> children in Grade 1 to 3.
>
> A child reads a short Filipino or Taglish story aloud. A Whisper speech model runs in the
> browser, on the child's own device, and marks each word. Ningning the firefly cheers them on,
> and missed words are saved for practice.
>
> Why on the device? A child's voice is sensitive data. It never leaves the device, and after the
> first load Kislap works with no internet. You can check it yourself: the on-screen privacy
> counter shows zero requests while a child reads.
>
> Try it: https://romeo-04.github.io/kislap/ · Code: https://github.com/Romeo-04/kislap
>
> Team stochastic4: Jhezra Tolentino, Ric Ian Barrios, Amiel Josiah Acuna, and Marcus Ceasar Austria. Thanks to Cognition and Devin [tag both] and AppBuildersPH.

Rules for both posts: the video plays inline, the post is public, no accuracy or "first" claims
(spec §19). Save both URLs here and in the README.

## D6 What runs locally

| Function | Where it runs |
|---|---|
| Speech recognition (Whisper) | In the browser, in a Web Worker, through Transformers.js and ONNX Runtime Web (WebAssembly) |
| Silence check before recognition | In the browser |
| Word scoring (alignment and marks) | In the browser |
| Game logic, mascot, sounds, stickers, Word Pop | In the browser |
| Progress (stars, stickers, streak, practice words) | Browser `localStorage` on the device |
| Privacy meter | In the browser (Resource Timing API) |

No audio and no text leaves the device. The browser network tab shows zero requests during
reading; it is the full check. The on-screen Privacy meter shows the reading screen's own requests
(it does not see the speech model's worker).

## D7 What requires internet

- The first load of the app from Vercel.
- The first download of the speech model files from Hugging Face.

Nothing else. After that, the app works with Wi-Fi and mobile data off. **[confirm with the
final offline check on the laptop and the Poco X6 Pro]**

## D8 Models used

| Model | Use | Format | Download | Licence and data |
|---|---|---|---|---|
| Whisper (OpenAI), base | Every device (laptop and phone), on WebAssembly | `onnx-community/whisper-base`, **q8** (the whole model) | ~73 MB (encoder 22 + decoder 51) | Apache-2.0 (`openai/whisper-base`); the ONNX export card states no licence |
| Whisper (OpenAI), base, fp16 on WebGPU | **Test option, not shipped by default** (only with `?tier=large` in the URL; it has not passed the reading loop and the offline check on a real GPU) | same repo, **fp16** | ~139 MB (encoder 39 + decoder 100) | same |
| `internetoftim/whisper-small-pld-fil-ONNX` (export of `sapinsapin/whisper-small-pld-fil`) | **Tested, not shipped** (does not run in Transformers.js 4.3.1) | — | — | Cards: MIT (export), Apache-2.0 (fine-tune). **Training data (UP-DSP PLD) is research and non-commercial use.** |
| Own int8 export of `sapinsapin/whisper-small-fsc` (public repo `acmrsu/kislap-whisper-small`) | **Tested, not shipped** (11 s or more per sentence on a laptop) | encoder + merged decoder, int8 | ~278 MB | Base card: Apache-2.0. **Training data (Filipino Speech Corpus) is for research and non-commercial use. It may not be viable for the App Builders Challenge.** Our repo grants no rights beyond the base model's terms. |

Sizes are the model files (encoder + decoder) listed on Hugging Face, without the small tokenizer and config files. The dtype per tier is set in `src/asr/tier.ts`; `GPU_BY_DEFAULT = false` there keeps every device on q8 WebAssembly. No LoRA adapter shipped. No model was trained by the team: the int8 export is a format conversion of an existing model, made for tests and not shipped.

## D9 Technologies and frameworks

Vite 8.3 · TypeScript 6.0 · React 19.3 · Transformers.js (`@huggingface/transformers`) 4.3.1 ·
ONNX Runtime Web 1.31 · WebAssembly (WebGPU only with the `?tier=large` test switch, off by default) · vite-plugin-pwa 2.0 (Workbox 7) · Vitest 5.0 ·
oxlint. **[add any library added after 18:00]**

## D10 APIs and cloud services

| Service | Used for |
|---|---|
| Vercel | Static hosting of the app (HTTPS). No server functions, no analytics. |
| GitHub Pages | Static hosting of the same build (HTTPS), the main link while Vercel's daily deploy limit is reached. |
| Hugging Face Hub (including its file CDN) | Hosting the model files, downloaded once |
| GitHub | Source code |

**No AI API and no cloud inference.**

## D11 Existing code and assets

- Full list with sources and licences: `docs/assets.md` (libraries, fonts, sounds, art, models, datasets).
- Fonts: Baloo 2 and Andika, SIL Open Font License 1.1, self-hosted.
- Models and datasets: see D8.
- Mascot, stories, stickers, and sounds: made during the event. **[designer confirms on #35]**
- No code from earlier projects. Everything was built during the hackathon.

## D12 AI development tools

- **Claude Code (Anthropic)**: spec validation, architecture and ADRs, issue breakdown, code
  (app shell, audio recorder, progress, privacy meter, offline mode, reading loop, scorer fixes),
  tests, and PR reviews with the pr-review-toolkit agents.
- **Claude Design (Anthropic)**: the visual design handoff (tokens, UI kit, mascot, sticker art).
- **CodeRabbit**: automated PR summaries on GitHub.
- **ChatGPT (OpenAI)** and **Claude (Anthropic)**: brainstorming.
- **Claude Code skills**: engineering and implementation practices (test-driven development, the
  impeccable design skill, pr-review-toolkit, planning and domain modelling).
- **[add Blender MCP only if the 3D mascot (#69) ships]**

## D13 Why does this product benefit from running AI locally?

A child's voice is sensitive data. Kislap processes it on the device, and it never goes to a
server. There is no account and no upload, and anyone can check this: the browser's network tab
shows zero requests while a child reads, and an on-screen Privacy meter shows the reading screen's
own requests. Because the model runs
locally, Kislap also works with no internet after the first download, in places where the signal
is weak or data is costly.
