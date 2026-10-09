# Submission answers (draft)

Copy these into the form. Each section maps to a deliverable issue (D1–D13). Text marked
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

| Name **[confirm spelling]** | Role | GitHub |
|---|---|---|
| | Lead: app shell, integration, offline, deploy | @Romeo-04 |
| | Designer: screens, Ningning, art, demo video | @Seedlign |
| | Model engineer: on-device speech model | @acmrsu |
| | Content, scoring, and QA | @emyol |

## D3 Public GitHub repository

https://github.com/Romeo-04/kislap · Live app: https://kislap.vercel.app

## D4 / D5 Demo video and posts

- Video file: **[link after recording]**
- X post (tags @cognition and Devin): **[URL]**
- LinkedIn post (tags @cognition and Devin): **[URL]**

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
| Whisper (OpenAI), base | Phones and devices without WebGPU | `onnx-community/whisper-base`, dtype **[confirm]** | ~77 MB (q8) **[confirm]** | MIT (Whisper) |
| `internetoftim/whisper-small-pld-fil-ONNX` (export of `sapinsapin/whisper-small-pld-fil`, a Whisper-small Filipino fine-tune) | Laptops with WebGPU | encoder fp32, decoder q4 **[confirm]** | ~586 MB **[confirm]** | Card: MIT. **Training data (UP-DSP PLD) is for research and non-commercial use.** Kislap is free and non-commercial. |

No LoRA adapter shipped **[confirm]**. No model was trained by the team **[confirm]**.

## D9 Technologies and frameworks

Vite 8.3 · TypeScript 6.0 · React 19.3 · Transformers.js (`@huggingface/transformers`) 4.3.1 ·
ONNX Runtime Web 1.31 · WebGPU and WebAssembly · vite-plugin-pwa 2.0 (Workbox 7) · Vitest 5.0 ·
oxlint. **[add any library added after 18:00]**

## D10 APIs and cloud services

| Service | Used for |
|---|---|
| Vercel | Static hosting of the app (HTTPS). No server functions, no analytics. |
| Hugging Face Hub | Hosting the model files, downloaded once |
| GitHub | Source code |

**No AI API and no cloud inference.**

## D11 Existing code and assets

- Libraries: all from npm, listed in D9 with their licences in `package.json`.
- Models and datasets: see D8.
- Mascot, stories, and art: original, made during the event. **[confirm with the designer]**
- Sounds and fonts: **[list from `docs/assets.md`]**
- No code from earlier projects. Everything was built during the hackathon.

## D12 AI development tools

- **Claude Code (Claude)**: planning, spec validation, architecture and ADRs, issue breakdown,
  and code for the app shell, audio recorder, progress, privacy meter, and offline mode.
- **[each teammate adds their tools in a comment on the D12 issue]**

## D13 Why does this product benefit from running AI locally?

A child's voice is sensitive data. Kislap processes it on the device, and it never goes to a
server. There is no account and no upload, and anyone can check this: the on-screen Privacy
meter and the browser network tab show zero requests while a child reads. Because the model runs
locally, Kislap also works with no internet after the first download, in places where the signal
is weak or data is costly.
