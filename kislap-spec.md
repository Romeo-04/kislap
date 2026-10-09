# Kislap: Implementation Spec

Project: AppBuildersPH Hackathon 2026 (theme: Local AI).
Use this file as the single source of truth. `CLAUDE.md` imports it on each session. Validation status: `docs/validation.md`. Architecture: `docs/architecture.md`, `docs/adr/`.

---

## 0. Instructions for Claude Code

- Time is short. Submission target: **08:30 on October 10, 2026** (Asia/Manila). Hard deadline: 10:00 AM, no extensions.
- Build the **Must** items first. Do not start a **Should** item until the full Must loop works end to end.
- Make decisions yourself. Use the defaults in this file. Ask the user only when you are blocked.
- **This spec is a starting point, not a limit.** You may change details and add features that help the child, the team, or the demo. Be creative. Read section 20 for the rules.
- **Create the competition issues.** As soon as the GitHub repository exists, create one issue for each deliverable in section 21 (use `gh issue create`). Do this before you write code.
- Commit often. Keep `main` deployable at all times.
- Keep every AI computation on the device. Do not add any cloud inference call.
- Write short, clear code comments. Write a `README.md` that states what runs locally and what needs internet (see section 14).
- Check library APIs against their current documentation before you use them. Some details in this file are from memory and marked **(verify)**.

---

## 1. Summary

**Kislap** is a reading game for Filipino children in Grade 1 to 3. The child reads a short story aloud, one sentence at a time. A small speech model runs in the browser and listens. The app marks each word as correct, missed, or unclear. A firefly mascot named Ningning reacts. The child earns stars and stickers. Missed words go into a short practice game.

**Brand.** App name: **Kislap** (Filipino for "sparkle"). Mascot: **Ningning**, a friendly firefly (Filipino: alitaptap). Tagline: "Basa. Kislap. Galing!" (Read. Sparkle. Great!). English descriptor: "Kislap: your reading buddy that listens on your device."

**Problem.** The World Bank says 91 percent of 10-year-olds in the Philippines cannot read and understand an age-appropriate text ([World Bank, April 2026](https://www.worldbank.org/en/news/press-release/2026/04/03/world-bank-backs-better-learning-for-21-million-filipino-students)).

**Why local AI.** A child's voice is sensitive data. It never leaves the device. There is no account, no server, and no leaderboard. After the first load, the app works with no internet.

The hackathon requires every submission to answer: **"Why does this product benefit from running AI locally?"** Keep that answer true in all design choices.

---

## 2. Locked decisions

| # | Topic | Decision |
|---|---|---|
| 1 | Demo device | Laptop with Chrome (main). Poco X6 Pro phone (second device). |
| 2 | Story language | Filipino and Taglish |
| 3 | Age band | Grade 1 to 3. Three stories: easy, medium, hard. |
| 4 | Team | 4 people: lead (integration), designer, model engineer, content and scoring and QA |
| 5 | Model plan | Use an existing Filipino Whisper fine-tune. LoRA is a stretch goal with a hard stop at 01:00. |
| 6 | Stack | Vite + TypeScript + Transformers.js. Not Flutter (too slow for the time left). |
| 7 | Hosting | Vercel (HTTPS is required for the microphone) |
| 8 | Mascot | **Ningning**, an original friendly firefly (alitaptap). **Not a tarsier** (too close to an existing brand). Decided. See section 9 for the rules. |
| 9 | Interface language | Filipino and English, with a language toggle the user can switch |
| 10 | Star thresholds | 50, 70, 90 percent (section 8) |
| 11 | "Unclear" words | Half credit |
| 12 | Progress storage | On the device only (browser storage) |
| 13 | Demo reader in the video | One team member. No real children without parent consent. |
| 14 | Video platform | **X and LinkedIn**, tagging **@cognition and Devin** (event rule, validated 2026-10-09) |
| 15 | "Why local" answer | The lead writes it. The content person reviews it. |
| 16 | App name | **Kislap** (Filipino for "sparkle"). Decided. Check the name against app stores, GitHub, and LinkedIn **(verify)**. |

---

## 3. User flow

1. Home screen: mascot, language toggle, "Offline ready" badge, big **Play** button.
2. Story map: three stories (easy, medium, hard). Show stars earned for each.
3. Reading screen: one sentence at a time.
   1. The child taps the **mic** button and reads the sentence.
   2. The child taps **stop** (or the app stops after about 1.5 seconds of silence).
   3. The app transcribes and scores the sentence.
   4. Words light up one by one: green (correct), yellow (unclear), orange (missed). The mascot reacts.
   5. Next sentence.
4. Result screen: 0 to 3 stars, confetti, sticker earned, mascot celebrates.
5. Word Pop (Should): missed words appear as bubbles. The child says each word to pop it.
6. Progress screen (Should): stickers, streak, stars.

**Why sentence by sentence.** Real-time streaming speech recognition on a phone is risky. A sentence-level loop gives a near-live feel and is much easier to build. Do real-time word highlighting only as a Could item.

---

## 4. Feature priorities

| Priority | Feature |
|---|---|
| **Must** | Mic recording, local transcription, word scoring, word highlighting (after each sentence) |
| **Must** | Three original stories |
| **Must** | Mascot with reactions |
| **Must** | 0 to 3 stars per story, sound, confetti |
| **Must** | Language toggle (Filipino and English) for all interface text |
| **Must** | Progress saved on the device |
| **Must** | Works offline after first load. "Offline ready" indicator. |
| **Should** | Sticker collection |
| **Should** | Word Pop mini-game |
| **Should** | Daily streak (no punishment for a missed day) |
| **Should** (added 2026-10-09) | Privacy meter ("0 bytes sent"), syllable help (pantig), firefly-jar sticker screen, mic-check screen, echo reading with pre-recorded teammate audio, local progress QR export |
| **Could** | Real-time word highlighting, mascot outfits, LoRA model |

---

## 5. Architecture

- Web app (PWA). Mobile-first layout (portrait). It must also work on a laptop.
- **Vite + TypeScript.** UI framework: React is acceptable (default). Use plain TypeScript if the team prefers.
- **Transformers.js** (`@huggingface/transformers`) runs the Whisper model in the browser.
- Run the model in a **Web Worker** so the screen stays responsive.
- Use **WebGPU** when available. Fall back to **WebAssembly (CPU)** with a smaller model.
- PWA via `vite-plugin-pwa` (service worker caches the app shell).
- Progress in browser storage (IndexedDB through a small helper, or `localStorage`).
- Deploy on **Vercel**. Do not enable COOP/COEP headers unless you need multi-thread WebAssembly. They can break cross-origin model loading.

### Suggested repo structure

```
kislap/
  CLAUDE.md                 (this spec)
  README.md
  index.html
  vite.config.ts
  vercel.json
  public/
    manifest.webmanifest
    icons/
    sounds/                 (own or free-licensed sounds only)
  src/
    main.tsx
    app/                    (screens: Home, StoryMap, Reading, Result, WordPop, Progress)
    asr/
      audio.ts              (record, decode, resample to 16 kHz mono Float32)
      worker.ts             (loads the model, runs transcription)
      transcribe.ts         (main-thread API to the worker)
    scoring/
      normalize.ts
      align.ts
      score.ts
      stars.ts
      score.test.ts
    game/
      progress.ts           (stars, stickers, streak, language)
      mascot.ts             (state machine and reaction lines)
    content/
      stories.json
    i18n/
      fil.json
      en.json
    ui/                     (shared components)
  scripts/
    convert-model.md        (steps used to export the model to ONNX)
```

---

## 6. Module contracts

Build to these contracts so people can work in parallel. The designer builds on fake data first.

```ts
// src/asr/transcribe.ts
export interface TranscribeResult {
  text: string;
  words?: { word: string; start: number; end: number }[]; // optional, only if timestamps work
}
export function transcribe(audio: Float32Array /* 16 kHz mono */): Promise<TranscribeResult>;
export function loadModel(onProgress?: (p: number) => void): Promise<void>;
export function isModelCached(): Promise<boolean>;

// src/scoring/score.ts
export type WordStatus = 'correct' | 'unclear' | 'missed';
export interface WordResult { word: string; status: WordStatus; heard?: string }
export function scoreReading(expectedText: string, transcript: string): {
  words: WordResult[];
  accuracy: number; // 0..1, correct = 1, unclear = 0.5, missed = 0
};

// src/scoring/stars.ts
export function starsFor(accuracy: number): 0 | 1 | 2 | 3;
```

---

## 7. Model plan

**Decided 2026-10-09 (grill Q1):** laptop large tier = `internetoftim/whisper-small-pld-fil-ONNX` (ready ONNX). Phone and bootstrap = `onnx-community/whisper-base`. The text below is the original plan.

**Primary model:** `sapinsapin/whisper-small-fsc` (Whisper-small fine-tuned on the Filipino Speech Corpus). The model card reports 15.9 percent word error rate and 7.1 percent character error rate on its held-out split.

**Steps:**
1. Export the model to ONNX. Use Optimum or the conversion script in the Transformers.js repository **(verify)**.
2. Quantize to 4-bit or 8-bit. Keep the encoder at higher precision if quality drops **(verify)**.
3. Upload the converted model to a public Hugging Face repo owned by the team. Load it in the app by repo ID.
4. Test speed and memory on the **Poco X6 Pro**. Do this early (Checkpoint 1).
5. Set `language: 'tl'` and `task: 'transcribe'` when you call the model. Taglish speech still works with this setting. English words inside Taglish are common.

**Fallback models (use if export fails or the phone is too slow):**
- A pre-converted Whisper-base or Whisper-tiny ONNX model from `onnx-community` or `Xenova` **(verify the exact repo names)**.
- Accept lower accuracy. Make the scorer more forgiving instead.

**Word timestamps.** Word-level timestamps in Transformers.js need a model export that includes the alignment heads **(verify)**. Do not depend on them. The sentence-level scorer in section 8 needs only the text.

**Model size.** Check the download size. If the total is above about 300 MB, use Whisper-base.

**Validated 2026-10-09 (see `docs/validation.md`).** `sapinsapin/whisper-small-fsc` has **no ONNX files** (one 967 MB fp32 safetensors). Export with **Optimum** (`optimum-cli export onnx`); the Transformers.js `convert.py` script no longer exists. Whisper-small sizes: fp32-enc + q4-dec ≈ 586 MB, q4f16 ≈ 200 MB. A ready Filipino ONNX exists: `internetoftim/whisper-small-pld-fil-ONNX`. Bootstrap with `onnx-community/whisper-base` (q8 ≈ 77 MB). **Licence:** FSC and PLD data are research / non-commercial use; disclose this in D8 and D11. Use Transformers.js **v4** (`@huggingface/transformers@^4.3`). The first load needs internet, and a large download is bad for a child's phone.

**LoRA (stretch only).** Start only if the full loop works at Checkpoint 2. Use a free Colab T4. Train on Filipino Speech Corpus and FLEURS `fil_ph`. Compare against the base model on a held-out set. If it is not clearly better and exported by **01:00**, drop it. Check each dataset license before you use it. No public child-speech dataset is known. Do not claim child-voice accuracy.

---

## 8. Scoring rules

1. **Normalize** both texts: lowercase, remove punctuation, collapse spaces. Keep Filipino letters. Keep common Taglish spelling variants close by using the similarity step below.
2. **Align** the expected words to the heard words with a word-level edit-distance alignment. Use character similarity as the substitution cost.
3. **Classify each expected word:**
   - similarity at least 0.85: `correct`
   - similarity from 0.60 to 0.85: `unclear`
   - below 0.60, or not heard: `missed`
4. **Accuracy** = (correct + 0.5 × unclear) / total expected words.
5. **Stars** (keep the numbers in one config file so the team can tune them after testing):

| Accuracy | Result |
|---|---|
| 90 percent or more | 3 stars |
| 70 to under 90 percent | 2 stars |
| 50 to under 70 percent | 1 star |
| Under 50 percent | 0 stars. Show a kind "try again" message. Never say "wrong." |

6. Write at least **10 unit tests**, including Taglish cases, extra words, skipped words, and a noisy transcript.
7. Speech models are less accurate on child voices. The scorer must be forgiving. Never punish a child for a model error.

---

## 9. Gamification

- **Mascot:** **Ningning**, an original, friendly firefly (alitaptap). Its glow matches the word highlighting: Ningning glows brighter as the child reads well. Ningning speaks the reaction lines. Do not copy any existing mascot, brand, or any organizer's design.
- **Mascot name check:** Ningning is also the stage name of a K-pop singer **(verify)**. Make the firefly clearly its own character. Do not use any real person's look, photos, or fan art style.
- **Mascot rules:** Do **not** use a tarsier (too close to an existing finance app brand). Avoid an owl (looks like the Duolingo owl). Avoid a bird named Maya (a known e-wallet brand). Avoid blue blob or octopus creatures (look like Bebol). Avoid names and looks of Read Along's Diya. Check any final name against app stores and LinkedIn **(verify)**.
- **Mascot states:** idle, listening, cheering, encouraging, celebrating. Use an SVG or CSS animation. Use a simple placeholder until the designer delivers.
- **Reactions:** short lines in Filipino and English (in the i18n files). Examples: "Galing!" / "Great job!", "Subukan natin ulit!" / "Let's try again!"
- **Stars:** see section 8.
- **Stickers (Should):** one per finished story. More for 3 stars.
- **Word Pop (Should):** missed words appear as bubbles. The child says the word. A short transcription checks it. The bubble pops with a sound.
- **Streak (Should):** count days played. A missed day **does not reset** the streak to zero. Show a "welcome back" message.
- **Do not add:** timers, lives, public leaderboards, accounts, or any server. These hurt slow readers and need personal data.

---

## 10. Content

- Write **3 original stories**: easy, medium, hard. Grade 1 to 3 level. Filipino and Taglish. Do not copy copyrighted text.
- Split each story into short sentences (about 4 to 10 words each; about 6 to 10 sentences per story).
- Use this format in `src/content/stories.json`:

```json
[
  {
    "id": "story-1",
    "title": { "fil": "Ang Maliit na Pusa", "en": "The Little Cat" },
    "level": "easy",
    "sentences": [
      { "text": "Si Mimi ay isang maliit na pusa." },
      { "text": "Mahilig siyang maglaro sa hardin." }
    ]
  }
]
```

(The example text is only a placeholder. The content person writes the final stories.)

---

## 11. Language toggle

- All interface text and mascot lines come from `src/i18n/fil.json` and `src/i18n/en.json`.
- A toggle on the home screen switches the language. Save the choice on the device.
- Stories stay in Filipino or Taglish. Titles and help text show in both languages.

---

## 12. Offline and PWA

- Use a service worker to cache the app shell.
- Transformers.js caches model files in the browser cache after the first download **(verify the cache settings)**.
- First load needs internet. Show a clear progress bar and a message such as "Preparing Kislap for offline use."
- Show an **"Offline ready"** badge when the app shell and the model are both cached.
- **Offline check (required before the demo):** load the app once, turn off Wi-Fi and mobile data, reload, and finish one full story. Do this on the laptop **and** on the Poco X6 Pro.
- Browsers can delete cached data under storage pressure. Keep a "Download for offline" button so the user can restore the cache.

---

## 13. Device checks

- Check WebGPU on the Poco X6 Pro at **Checkpoint 1**. If the phone has no WebGPU or loads the model too slowly, use the smaller model on the phone and keep the larger model for the laptop.
- The microphone needs HTTPS or localhost. Deploy a "hello world" to Vercel in the first hour.
- Use large touch targets (at least 48 px). Use a large story font. Use high contrast.

---

## 14. Submission disclosures

Write these into `README.md` and the submission form.

**What runs locally:** speech recognition, scoring, game logic, progress storage, mascot and sounds.

**What needs internet:**
- The first-time model download (from Hugging Face)
- Loading the app from Vercel the first time

**No cloud inference.** No audio is uploaded or stored.

**To list in the submission:**
- Project name, short description, team members, public GitHub repository
- Demo video and the LinkedIn video URL
- Models used (base model, fine-tune, any fallback, and LoRA if used)
- Technologies and frameworks (Vite, TypeScript, React if used, Transformers.js, ONNX Runtime Web, WebGPU)
- APIs and cloud services (Hugging Face Hub for model files, Vercel for hosting; no AI API)
- Existing code and assets (all libraries, sounds, fonts, and datasets with licenses)
- AI development tools used (Claude, Claude Code, and any other)

**Required answer:** "Why does this product benefit from running AI locally?"
Suggested base: "A child's voice is sensitive data. Kislap processes it on the device. It never goes to a server. After the first download, the app works with no internet, in places with weak signal."

---

## 15. Open items

1. ~~**Under 50 percent behavior.**~~ **Settled 2026-10-09 (ADR-0010):** 0 stars, but finishing a story always earns a sticker, with a kind message.

---

## 16. Team and timeline (Asia/Manila)

| Person | Role |
|---|---|
| Lead | App shell, integration, offline mode, Vercel deploy, submission |
| Designer | Screens, mascot, sticker art, demo video editing |
| Model engineer | Model export, quantization, browser test, optional LoRA |
| Content, scoring, QA | Stories, scoring code and tests, device testing, README draft |

| Time | Goal |
|---|---|
| 14:15–15:00 | Kickoff. Lock scope. Create the repo. |
| 15:00–19:00 | Parallel build |
| **19:00** | **Checkpoint 1:** the model transcribes a real recording in the browser (laptop and phone). The UI works with fake data. The scorer passes its tests. |
| 20:00–00:00 | Integration |
| **00:00** | **Checkpoint 2:** the full loop works end to end |
| 00:00–01:00 | Offline mode and device tests |
| **01:00** | **Feature freeze.** Bug fixes only. LoRA stops. |
| 01:00–03:00 | Record the backup demo video |
| 03:00–06:30 | Sleep |
| 06:30–08:30 | Final fixes. Final video on LinkedIn. Submit. |
| 08:30–10:00 | Buffer. Emergencies only. |
| 10:00–12:30 | Travel to Cyberzone, SM Makati. Rehearse the live pitch. |
| **13:00–19:00** | **Demo Day (in person).** Finalists pitch and demo live. All finalists must attend. |

---

## 17. Order of work for Claude Code

1. Create the Vite + TypeScript project. Add the PWA plugin. Deploy to Vercel. Confirm the microphone works over HTTPS.
2. Build `audio.ts`: record, decode, resample to 16 kHz mono.
3. Build the worker and `transcribe.ts` with a fallback Whisper model. Get a result on screen. Then swap in the primary model.
4. Build the scorer with tests (section 8).
5. Build the reading screen with fake mascot art. Connect ASR, scorer, and word highlighting.
6. Add stars, result screen, sound, and confetti.
7. Add progress storage and the language toggle.
8. Add the offline badge and run the offline check.
9. Add Should items in this order: stickers, streak, Word Pop.
10. Finish `README.md` with the disclosures in section 14.

---

## 18. Done means

- A child can read all sentences of one story and see correct word marks, stars, and a sticker.
- The app runs fully offline after the first load, on the laptop and on the Poco X6 Pro.
- No network request is made during reading (check the browser network tab).
- The language toggle changes all interface text.
- The scorer unit tests pass.
- `README.md` has all disclosures and the "why local" answer.
- The public GitHub repository and the Vercel link both work.

---

## 19. Feature matrix: how Kislap is different

Use this section for the README, the pitch, and the demo script. Facts come from the sources at the end of this section. Items marked **(verify)** are not confirmed. Check them before you publish.

| Feature | **Kislap** | Google Read Along | Microsoft Reading Coach | Amira Learning | Filipino research prototypes | Bebol's World |
|---|---|---|---|---|---|---|
| Main goal | Reading aloud and early literacy | Reading practice | Reading fluency | Reading assessment and tutoring | Reading fluency and miscue detection | Speech and language therapy support (pronunciation, speech delay) |
| Product stage | Working demo (target: 10:00 on October 10) | Released product | Released product | Released product | Research prototypes | Proposal with prototype screens |
| Speech AI runs on the device | Yes | Yes (voice is analyzed on the device) | Not stated. An account is needed. **(verify)** | Not stated. Data stays in Amira's own infrastructure. | Not stated | Not stated |
| Works offline after first load | Yes | Yes (after the first download) | Not stated **(verify)** | Not stated. One directory says it needs internet. **(verify)** | Not stated | Partly. Downloadable modules for offline use (stated as a feature). |
| No account or login | Yes | Yes (no Google account needed) | No (Microsoft account) | No (school or district setup) | Not stated | No. Linked parent and child accounts with email. |
| Filipino and Taglish stories | **Yes (core focus)** | Not confirmed **(verify the current language list)** | Not confirmed **(verify)** | English and Spanish | Filipino | Filipino words and phrases (such as puno and Kumusta). Not reading passages. |
| Target age | Grade 1 to 3 | Age 5 and up | Learners of many ages | K to 3 (primary) | Grade 5 and 6 (Basa-Kabataan); children (UP ART) | Ages 4 to 12 |
| Install needed | No. Open a link (PWA). | Yes (Android app, per launch coverage **(verify the current platforms)**) | Browser or Windows app | School platform | Mobile app or research system | App (mobile screens shown) |
| Game elements (mascot, rewards) | Mascot (Ningning), stars, stickers, Word Pop | Mascot (Diya), word games, prizes | Streak rewards, progress milestones | Celebrates growth | Not a focus | Mascot (Bebol), level map, badges, in-app currency, daily goal |
| Word-level feedback | Yes | Yes | Yes | Yes (down to phoneme level) | Yes (miscue detection) | Yes (pronunciation score, such as 80 percent accuracy) |
| Targeted practice on missed words | Yes (Word Pop) | Yes (word games) | Yes (practice words) | Yes (micro-interventions) | Recommender (Basa-Kabataan) | Yes (repetition exercises, adaptive difficulty) |
| Teacher dashboard | **No (not in scope)** | Not a focus | Yes | Yes | Not stated | Yes (classroom dashboards and therapist portal, planned) |
| Model is open and swappable | **Yes (open Whisper weights)** | No | No | No | Varies | Not stated (no model named) |
| Privacy can be checked by the user | **Yes. Open the network tab and see no upload.** | Stated by Google | Stated by Microsoft | Stated by Amira | Not stated | Not stated. Accounts and shared reports suggest stored data **(verify)** |
| Cost | Free | Free | Free | Paid, through schools | Not stated | Freemium. Premium at 149 pesos per month. School and therapy-center licenses. |

### Honest position

- **Google Read Along is the closest product.** It already runs speech recognition on the device, works offline, needs no account, and uses a mascot and word games. Do not say that Kislap is the first on-device reading tutor.
- **Do not claim to be better in accuracy or content.** Read Along and Amira have more stories, more polish, and more research. Kislap has 3 stories and no proven accuracy on child voices.
- **Do not claim a teacher dashboard or phoneme-level coaching.** Amira and Microsoft have them. Kislap does not.

### What is different (safe claims)

1. **Filipino and Taglish first.** Stories and scoring are built for Filipino and for Taglish code-switching. The scorer is forgiving of English words inside Filipino sentences.
2. **Grade 1 to 3 focus.** **(source needed — not found in validation; drop the number if no source by 01:00)** A national commission reports that 85 percent of students in Grades 1 to 3 have difficulty reading. Kislap targets exactly this group.
3. **Open web app, no install.** A PWA opens from a link. It is not tied to one app store. WebGPU is available in current Chrome, Edge, Firefox (some platforms), and Safari 26.
4. **Open and swappable model.** Kislap uses open Whisper weights fine-tuned for Filipino. Anyone can inspect, replace, or fine-tune the model with LoRA.
5. **Verifiable privacy.** The code is public. A judge can open the browser network tab and see that no audio leaves the device.
6. **No account at all.** Progress stays in the browser on the device.

### Compared with Bebol's World

Bebol's World is a proposal for speech and language therapy support for children aged 4 to 12. It solves a different problem from reading.

- **Goal.** Bebol's World targets pronunciation and speech delay. The child copies a recorded word. Kislap targets reading. The child reads a written sentence, and the app checks it against the expected text.
- **Accounts and data.** Bebol's World plans linked parent and child accounts, a forum, reports, classroom dashboards, and a therapist portal. These need a server. Kislap has no account and no server.
- **Local AI.** The Bebol's World document does not say where its AI runs. Its offline mode is downloadable modules. Kislap runs the speech model on the device by design. This matches the hackathon rule that meaningful AI must run locally.
- **Stage.** Bebol's World shows a proposal with prototype screens. Kislap must be a working demo.
- **Clinical claims.** Bebol's World aligns with speech therapy practice. Kislap is a reading game. Make no therapy or diagnosis claim.
- **Business.** Bebol's World plans a monthly premium plan and school licenses. Kislap is free and open.
- **Overlap.** Both use a mascot, level progression, badges, and a daily goal. Make the Kislap mascot and art clearly different. Do not copy the characters, colors, or logo of Bebol's World.
- **Worth borrowing (Should items).** A daily goal bar and progress rings on the profile screen.

### One-line pitch

"Kislap is an open, Filipino-first reading game that listens on the child's own device. No app store, no account, no upload."

### Sources

- Google Read Along (on-device speech, offline, no account): https://www.blog.google/outreach-initiatives/education/early-access-Read-Along and https://www.techradar.com/news/google-launches-a-new-read-along-app-to-help-you-with-homeschooling
- Microsoft Reading Coach: https://www.microsoft.com/en-us/education/blog/?p=7324 and https://support.microsoft.com/en-au/topic/getting-started-with-reading-coach-4bb004e9-2eda-4ee5-b3d6-ca10bc42f6cb
- Amira Learning: https://theewf.org/partners/view/amira-learning and https://www.techlearning.com/how-to/amira-learning-teaching-with-the-ai-powered-reading-tool
- Bebol's World: proposal document with prototype screens, supplied by the team
- Filipino research: Pascual and Guevara, "Reading Miscue Detector and Automated Reading Tutor for Filipino," Science Diliman 29(1), 2017 (https://journals.upd.edu.ph/index.php/sciencediliman/article/view/5622/5042); Basa-Kabataan paper (Grades 5 and 6 speech recognition app)
- Learning crisis: https://www.worldbank.org/en/news/press-release/2026/04/03/world-bank-backs-better-learning-for-21-million-filipino-students and https://www.youngpostclub.com/yp/news/asia/article/3341658/philippines-faces-decade-long-challenge-education-crisis-deepens

---

## 20. Creative freedom and guardrails

**This document does not limit you.** The team wants good ideas, not only a copy of this spec. If you see a way to make Kislap more helpful, more fun, or a better local-AI demo, build it. You may change any detail in this file, including the Should and Could items and the locked decisions, if you have a clear reason.

### How to use this freedom

Before you add or change a feature, ask four questions:
1. Does it help a child read, or help the demo show local AI?
2. Can you finish and test it in about one hour or less?
3. Does the full Must loop still work after the change?
4. Does it stay inside the hard rules below?

If the answer to all four is yes, go ahead. Do not wait for approval.

### Hard rules (these do not change)

1. **AI runs on the device.** No cloud inference. No audio upload. No account or server for the child.
2. **Child safety and a kind tone.** Never say "wrong." Never punish a model error. No timers, lives, or public leaderboards.
3. **The deadline.** Feature freeze is at 01:00. Submission target is 08:30 on October 10. The Must loop comes before every new idea.
4. **Honest claims.** Do not claim better accuracy, more content, or "first of its kind" (see section 19).
5. **Own or free-licensed assets only.** Do not copy any mascot, character, logo, or text.
6. **Disclosure.** List every new library, model, sound, font, and dataset in `README.md` (section 14).

### Keep a change log

Add a short section to `README.md` called "Additions beyond the spec." For each change, write one or two lines: what you changed and why. The lead uses it for the submission and the demo script. If you change a locked decision (section 2), also tell the user in your final message.

### Idea starters (not required; pick only what fits)

- **Echo reading.** The app shows a sentence and reads it aloud first. The child then repeats it. (Check browser text-to-speech support for Filipino before you promise this **(verify)**.)
- **Syllable help.** Tap a hard word to see it split into syllables, such as "ba-ta."
- **Auto difficulty.** Suggest an easier or harder story based on the last result.
- **Today's words.** A short daily review of the child's missed words.
- **Mic check screen.** Test the microphone and room noise before reading. This also helps child voices.
- **Read together mode.** A parent and child take turns on sentences.
- **Teacher stories.** Let an adult paste or import their own short story as plain text. It stays on the device.
- **Local progress summary.** Export a printable page or a QR code of the child's progress. No server needed.
- **Accessibility.** Text size control, high-contrast mode, reduced-motion mode, and a dyslexia-friendly font option.
- **Mascot life.** Mascot outfits, small idle animations, and phone haptics for cheers.
- **Demo helpers.** An "Offline ready" screen with a visible Wi-Fi-off check, and a live panel that shows "0 bytes sent" to support the privacy claim.

### Priority order for new work

1. Fix any bug in the Must loop.
2. Finish the Should items (stickers, streak, Word Pop).
3. Add your own ideas, smallest and safest first.
4. Stop at the feature freeze. Spend the last hours on testing, the demo, and the README.

---

## 21. Competition deliverables (create these as GitHub issues)

**Source:** the organizer's submission checklist (AppBuildersPH Hackathon 2026, Local AI). **Deadline: 10:00 AM, October 10, 2026. No extensions.** Our target is 08:30. Check the official rules page for any detail not shown on the slides, such as required hashtags or the submission form link **(verify)**.

### Instructions for Claude Code

- Create the labels first: `deliverable`, `submission`, `video`, `disclosure`, `qa`, and one owner label per role: `owner:lead`, `owner:designer`, `owner:model`, `owner:content-qa`.
- Create one issue per item below. Use the title, labels, and body as written. Put the checklist in the issue body as task-list items (`- [ ]`).
- Create one tracking issue, "Competition submission tracker," that lists every deliverable issue as a task-list item.
- Do not assign people by name. Team usernames are not known. The owner label shows the role.
- If a label or `gh` command fails, continue and report what failed.

### Tracker

**Title:** Competition submission tracker
**Labels:** `submission`
**Due:** Submit by 08:30 on October 10. Hard deadline 10:00 AM.
**Body:** Track every deliverable here. Close this issue only after the form is submitted and the confirmation is saved.
- [ ] D1 Project name and short description
- [ ] D2 Team members
- [ ] D3 Public GitHub repository
- [ ] D4 Demo video
- [ ] D5 LinkedIn video URL
- [ ] D6 What runs locally
- [ ] D7 What requires internet
- [ ] D8 Models used
- [ ] D9 Technologies and frameworks
- [ ] D10 APIs and cloud services
- [ ] D11 Existing code and assets
- [ ] D12 AI development tools
- [ ] D13 Answer: "Why does this product benefit from running AI locally?"
- [ ] D14 Final pre-submission check
- [ ] D15 Submit the form

---

### D1 Project name and short description

**Labels:** `deliverable`, `submission`, `owner:lead`
**Due:** 01:00 (draft), 08:00 (final)
**Body:**
Write the project name and the short description for the form.
- Name: Kislap (mascot: Ningning the firefly)
- Draft description: "Kislap is a free reading game for Filipino children in Grade 1 to 3. A child reads a short story aloud, one sentence at a time. A small speech model runs in the browser, on the child's own device. It marks each word as correct, missed, or unclear. A mascot reacts, and the child earns stars and stickers. Missed words go into a short practice game. The app understands Filipino and Taglish. It needs no account and no server. After the first load, it works with no internet. The child's voice never leaves the device."

**Acceptance criteria:**
- [ ] The text matches what the app really does at submission time
- [ ] The text is in the README and in the form
- [ ] The text makes no claim about child-voice accuracy or "first of its kind"

### D2 Team members

**Labels:** `deliverable`, `submission`, `owner:lead`
**Due:** 01:00
**Body:** List every team member with full name, role, and a contact or profile link if the form asks for it.
**Acceptance criteria:**
- [ ] All four members are listed with the correct spelling
- [ ] Each member agrees to the list
- [ ] The list is in the README

### D3 Public GitHub repository

**Labels:** `deliverable`, `submission`, `owner:lead`
**Due:** Create now. Make public before 08:00.
**Body:** The repository must be public when we submit.
**Acceptance criteria:**
- [ ] The repository is public (check in a private browser window)
- [ ] `README.md` has the description, setup steps, and the disclosures from D6 to D13
- [ ] A license file is present. Check that it fits the model and dataset licenses **(verify)**
- [ ] No secrets, tokens, or private data in the code or the history
- [ ] The Vercel link is in the README
- [ ] The latest working code is on `main`

### D4 Demo video

**Labels:** `deliverable`, `submission`, `video`, `owner:designer`
**Due:** Backup recording by 03:00. Final by 07:30.
**Body:** Record a short demo video that proves the product works and runs locally.
Suggested storyboard (about 90 seconds to 2 minutes):
1. The problem: many young Filipino children cannot read at grade level (use the World Bank figure).
2. Open the app and show "Offline ready."
3. Turn off Wi-Fi and mobile data on camera.
4. A teammate reads a story sentence aloud.
5. Words light up, the mascot reacts, and stars and a sticker appear.
6. Show the browser network tab with no upload during reading.
7. State why local AI matters: the child's voice stays on the device.

**Acceptance criteria:**
- [ ] The video shows the full reading loop working with no internet
- [ ] A teammate reads. No real child appears without written parent consent
- [ ] Audio is clear and captions are included
- [ ] Only own or free-licensed music, sounds, and images are used
- [ ] The video does not claim better accuracy or "first of its kind"
- [ ] A backup copy is saved outside LinkedIn

### D5 LinkedIn video post and URL

**Labels:** `deliverable`, `submission`, `video`, `owner:lead`
**Due:** Post by 08:00
**Body:** The event page says: "Post your build on X and LinkedIn, tagging @cognition and Devin." Post on both.
**Acceptance criteria:**
- [ ] The video is posted on X and on LinkedIn, and both posts are public (check in a private browser window)
- [ ] Both posts tag @cognition and Devin
- [ ] The post uses any hashtags or tags the organizer requires **(verify)**
- [ ] The URL is saved in the README and in this issue
- [ ] The video plays on a phone and on a laptop

### D6 What runs locally

**Labels:** `deliverable`, `disclosure`, `owner:model`
**Due:** 01:00 (draft)
**Body:** State clearly what runs on the device.
Draft: speech recognition, word scoring, game logic, mascot and sounds, and progress storage.
**Acceptance criteria:**
- [ ] The list matches the final code
- [ ] The README has a table of each AI function and where it runs
- [ ] A network-tab check confirms no audio or text leaves the device during reading

### D7 What requires internet

**Labels:** `deliverable`, `disclosure`, `owner:model`
**Due:** 01:00 (draft)
**Body:** State clearly what needs internet.
Draft: the first-time model download from Hugging Face, and the first load of the app from Vercel. Nothing else.
**Acceptance criteria:**
- [ ] The statement matches the final behavior
- [ ] The offline check passes on the laptop and on the Poco X6 Pro
- [ ] Any extra network request found in testing is removed or disclosed

### D8 Models used

**Labels:** `deliverable`, `disclosure`, `owner:model`
**Due:** 01:00
**Body:** List every model with its source, size, and license.
**Acceptance criteria:**
- [ ] Base model: Whisper (OpenAI), with the version
- [ ] Fine-tune: `sapinsapin/whisper-small-fsc`, or the fallback model if used
- [ ] Quantization format and final download size
- [ ] LoRA adapter, only if it ships
- [ ] Each license is checked and listed

### D9 Technologies and frameworks

**Labels:** `deliverable`, `disclosure`, `owner:lead`
**Due:** 01:00
**Body:** List the stack from `package.json`.
**Acceptance criteria:**
- [ ] Vite, TypeScript, React (if used), Transformers.js, ONNX Runtime Web, WebGPU, and `vite-plugin-pwa` are listed with versions
- [ ] Any library added during the build is added to the list

### D10 APIs and cloud services

**Labels:** `deliverable`, `disclosure`, `owner:lead`
**Due:** 01:00
**Body:** List every external service.
Draft: Hugging Face Hub (model files), Vercel (hosting), GitHub (code). No AI API and no cloud inference.
**Acceptance criteria:**
- [ ] The list is complete and matches the network requests seen in testing
- [ ] The README states plainly that no cloud AI is used

### D11 Existing code and assets

**Labels:** `deliverable`, `disclosure`, `owner:designer`
**Due:** 01:00
**Body:** List all existing code and assets we did not create.
**Acceptance criteria:**
- [ ] Every library, font, sound, icon, and image has a source and a license
- [ ] The datasets used for any training or testing are listed with licenses (Filipino Speech Corpus, FLEURS) **(verify)**
- [ ] The mascot and all art are original
- [ ] Confirm no pre-existing project code is used. The event rule says everything must be built during the hackathon (validated 2026-10-09)

### D12 AI development tools

**Labels:** `deliverable`, `disclosure`, `owner:lead`
**Due:** 01:00
**Body:** List every AI tool used to plan or write code, content, or art.
**Acceptance criteria:**
- [ ] Claude and Claude Code are listed, with what they were used for
- [ ] Every other AI tool used by any teammate is listed
- [ ] Each teammate confirms their tools in a comment on this issue

### D13 Answer: "Why does this product benefit from running AI locally?"

**Labels:** `deliverable`, `submission`, `owner:lead`, `owner:content-qa`
**Due:** 02:00 (draft), 08:00 (final)
**Body:** The organizer says every submission must answer this question. The lead writes the answer. The content and QA person reviews it.
Draft base: "A child's voice is sensitive data. Kislap processes it on the device. It never goes to a server. After the first download, the app works with no internet, in places with weak signal."
**Acceptance criteria:**
- [ ] The answer is true for the final product
- [ ] The answer names the privacy benefit and the offline benefit
- [ ] The answer is in the README, the video, and the form

### D14 Final pre-submission check

**Labels:** `qa`, `submission`, `owner:content-qa`
**Due:** 08:00
**Body:** Test everything a judge will open, in a private browser window and on a second device.
**Acceptance criteria:**
- [ ] The Vercel link opens and the app loads
- [ ] A full story works with Wi-Fi off (laptop and Poco X6 Pro)
- [ ] The GitHub repository is public and the README is complete
- [ ] The LinkedIn video is public and plays
- [ ] All links in the README work
- [ ] Every checklist item D1 to D13 is closed

### D15 Submit the form

**Labels:** `deliverable`, `submission`, `owner:lead`
**Due:** Submit by 08:30. Hard deadline 10:00 AM, October 10.
**Body:** Find the official submission form link and read its fields early. Check them before 19:00 so no field is a surprise.
**Acceptance criteria:**
- [ ] The form link is saved in this issue **(verify the link and the fields)**
- [ ] All fields are filled from D1 to D13
- [ ] The form is submitted before 08:30
- [ ] A screenshot or confirmation email is saved in the repository wiki or the team chat
- [ ] The tracker issue is closed
