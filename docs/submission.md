# Submission answers (draft)

Copy these into the form. **Before 08:00:** check D1 and the README feature list against what is merged (Word Pop, echo reading, and the progress QR may not ship). Each section maps to a deliverable issue (D1–D13). Text marked
**[confirm]** must be checked against the final build before 08:00. The final versions also go
into `README.md` where the README already has that section.

## D1 Project name and short description

**Kislap** (mascot: Ningning the firefly)

Kislap is a free reading game for Filipino children in Grade 1 to 3. A child reads a short story
aloud, one sentence at a time. A speech model runs in the browser, on the child's own device. It
marks each word as correct, unclear, or missed. Ningning the firefly reacts, and the child earns
stars and stickers. Missed words come back in a short practice game. The app understands
Filipino and Taglish. It needs no account and no server. After the first load, it works with no
internet. The child's voice never leaves the device.

## D2 Team members

**Team name: stochastic4**

| Name | Role | GitHub |
|---|---|---|
| Jhezra Tolentino | Lead: app shell, integration, offline, deploy | @Romeo-04 |
| Ric Ian Barrios | Designer: screens, Ningning, art, demo video | @Seedlign |
| Amiel Josiah Acuna | Model engineer: on-device speech model | @acmrsu |
| Marcus Ceasar Austria | Content, scoring, and QA | @emyol |

## D3 Public GitHub repository

https://github.com/Romeo-04/kislap · Live app: https://kislap.vercel.app

## D4 / D5 Demo video and posts

- Video file: **[link after recording]**
- X post (tags @cognition and Devin): **[URL]**
- LinkedIn post (tags @cognition and Devin): **[URL]**

### Post text for X (≤ 280 characters with the link)

> Kislap ✨ a Filipino-first reading game. A child reads aloud, and Whisper runs on the device
> to mark each word. No account, no upload, works offline. Built at #AppBuildersPH by stochastic4
> @cognition @DevinAI
> https://kislap.vercel.app

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
> Try it: https://kislap.vercel.app · Code: https://github.com/Romeo-04/kislap
>
> Team stochastic4: [names]. Thanks to Cognition and Devin [tag both] and AppBuildersPH.

Rules for both posts: the video plays inline, the post is public, no accuracy or "first" claims
(spec §19). Save both URLs here and in the README.

## D6 What runs locally

| Function | Where it runs |
|---|---|
| Speech recognition (Whisper) | In the browser, in a Web Worker, through Transformers.js and ONNX Runtime Web (WebGPU, or WebAssembly) |
| Silence check before recognition | In the browser |
| Word scoring (alignment and marks) | In the browser |
| Game logic, mascot, sounds, stickers, Word Pop | In the browser |
| Progress (stars, stickers, streak, practice words) | Browser `localStorage` on the device |
| Privacy meter | In the browser (Resource Timing API) |

No audio and no text leaves the device. The on-screen Privacy meter and the browser network tab
both show zero requests during reading.

## D7 What requires internet

- The first load of the app from Vercel.
- The first download of the speech model files from Hugging Face.

Nothing else. After that, the app works with Wi-Fi and mobile data off. **[confirm with the
final offline check on the laptop and the Poco X6 Pro]**

## D8 Models used

| Model | Use | Format | Download | Licence and data |
|---|---|---|---|---|
| Whisper (OpenAI), base | Every device | `onnx-community/whisper-base`, dtype **[confirm]** | ~77 MB (q8) **[confirm]** | Apache-2.0 (`openai/whisper-base`); the ONNX export card states no licence |
| `internetoftim/whisper-small-pld-fil-ONNX` (export of `sapinsapin/whisper-small-pld-fil`) | **Tested, not shipped** (does not run in Transformers.js 4.3.1) | — | — | Cards: MIT (export), Apache-2.0 (fine-tune). **Training data (UP-DSP PLD) is research and non-commercial use.** |

No LoRA adapter shipped **[confirm]**. No model was trained by the team **[confirm]**.

## D9 Technologies and frameworks

Vite 8.3 · TypeScript 6.0 · React 19.3 · Transformers.js (`@huggingface/transformers`) 4.3.1 ·
ONNX Runtime Web 1.31 · WebGPU and WebAssembly · vite-plugin-pwa 2.0 (Workbox 7) · Vitest 5.0 ·
oxlint. **[add any library added after 18:00]**

## D10 APIs and cloud services

| Service | Used for |
|---|---|
| Vercel | Static hosting of the app (HTTPS). No server functions, no analytics. |
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
server. There is no account and no upload, and anyone can check this: the on-screen Privacy
meter and the browser network tab show zero requests while a child reads. Because the model runs
locally, Kislap also works with no internet after the first download, in places where the signal
is weak or data is costly.
