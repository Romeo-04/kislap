# Spec validation — `kislap-spec.md`

Validated 2026-10-09 15:30–16:30 (Asia/Manila). Method: `validating-ideas` (inventory → classify →
verify facts against primary sources → verdicts → grill only the decisions). The grill log is at
the bottom and grows as the team answers.

## Coverage

- **Read in full:** `kislap-spec.md` (§0–§21), `.claude/skills/git-operations/SKILL.md`.
- **Primary sources opened:** Hugging Face model API and file trees (`sapinsapin/whisper-small-fsc`,
  `onnx-community/whisper-{tiny,base,small}[_timestamped]`, `internetoftim/whisper-small-pld-fil-ONNX`,
  `sapinsapin/filipinospeechcorpus`, `sapinsapin/pld`, `google/fleurs`), npm
  (`@huggingface/transformers`, `vite-plugin-pwa`), Transformers.js repo, docs, and Whisper source,
  Chrome WebGPU 121 notes, caniuse WebGPU, MDN getUserMedia / speechSynthesis, the World Bank
  2026-04-03 press release, Wikipedia (Ningning), Read Along launch coverage, the event page
  https://cerebralvalley.ai/e/appbuildersph-hackathon-2026.
- **Not checked:** the organizer's slides (not available to us), the official Read Along language
  list (help page 404), the "85 percent of Grades 1–3" commission figure (no source in spec), real
  device behaviour on the Poco X6 Pro (needs the phone — Checkpoint 1 task).
- **No code exists yet**, so there are no test suites to run.

## Verdict table (Contradicted and Inconsistent first)

| ID | Idea | Source | Kind | Verdict | Evidence |
|---|---|---|---|---|---|
| I1 | Video goes on **LinkedIn** only | §2 #14, §21 D5 | Decision vs external rule | **Contradicted** | Event page: "Post your build on X and LinkedIn, tagging @cognition and Devin." |
| I2 | "Any code reused from KitaKo or other past projects is listed" | §21 D11 | Assumption | **Contradicted** | Event page: "Everything must be built during the hackathon. Pre-existing work isn't allowed." Reusing past code is a rules risk, not a disclosure item. |
| I3 | Timeline ends at submission (08:30–10:00) | §16 | Assumption | **Contradicted / incomplete** | Event page: Demo Day **in person, Oct 10, 13:00–19:00, Cyberzone SM Makati**; finalists must attend and pitch live. The spec has no pitch, live-demo, or travel plan. |
| I4 | Primary model `sapinsapin/whisper-small-fsc`, "export to ONNX, quantize, upload" | §7 | Fact + plan | **Holds, but costly** | Model exists, WER 15.9 % / CER 7.1 % holds. **No ONNX files**; one fp32 `model.safetensors` of **967 MB**. Needs `optimum-cli export onnx` + quantization: a 1–2 h risk. |
| I5 | Use the Transformers.js conversion script | §7 step 1 | External claim | **Contradicted** | `scripts/convert.py` is gone from the Transformers.js main branch; the README now points to Optimum (`optimum-onnx`). |
| I6 | Transformers.js version (implied v3) | §5 | External claim | **Contradicted** | npm: `@huggingface/transformers` **4.3.1** (2026-10-07). Use `^4.3`. |
| I7 | "If above ~300 MB use Whisper-base" + Whisper-small as primary | §7 | Inconsistent | **Inconsistent** | Whisper-small ONNX: fp32-enc + q4-dec ≈ **586 MB**, fp16-enc + q4-dec ≈ 410 MB, q4f16 ≈ **200 MB** (needs WebGPU `shader-f16`). Only q4f16 fits the spec's own 300 MB rule. |
| I8 | Model licence is clean (Apache) | §7, D8, D11 | Fact | **Contradicted (needs caveat)** | Card says Apache-2.0, but FSC data is "distributed for research use"; the author's sibling card says FSC/PLD "research and non-commercial use only… a model trained on them carries those terms". FLEURS is CC-BY-4.0 (holds). |
| I9 | `language: 'tl'` | §7 step 5 | External claim | **Holds** | Whisper mapping `['tl','tagalog']`, token `<|tl|>`. Both strings work. |
| I10 | Word timestamps need alignment heads; don't depend on them | §7 | External claim | **Holds** | Also needs a decoder exported with cross-attentions. `onnx-community/whisper-*_timestamped` has them; plain repos and the Filipino ONNX do not. |
| I11 | Transformers.js caches models in the browser | §12 | External claim | **Holds** | `env.useBrowserCache` default true, Cache API key `transformers-cache`. |
| I12 | Service worker caches the app shell (`vite-plugin-pwa`) | §5, §12 | External claim | **Holds, with a limit** | vite-plugin-pwa **v2.0.0** (Workbox 7.4). `maximumFileSizeToCacheInBytes` default 2 MiB, so model files must **not** be precached (ADR-0007). |
| I13 | No COOP/COEP unless multi-thread WASM | §5 | External claim | **Holds** | Single-thread WASM needs none. If enabled later, use COEP `credentialless`, not `require-corp`, or Hugging Face fetches can break. |
| I14 | WebGPU on the Poco X6 Pro | §13 | External claim | **Unproven** | Chrome 121+ enables WebGPU on Android 12+ with Qualcomm/ARM GPUs (Mali-G615 is in scope), but no per-GPU confirmation. Test: `await navigator.gpu?.requestAdapter()` and check `shader-f16` on the phone. |
| I15 | Mic needs HTTPS | §13 | External claim | **Holds** | MDN: `getUserMedia` is secure-context only. Vercel is HTTPS. |
| I16 | Safari 26 WebGPU; Firefox on some platforms | §19 | External claim | **Holds** | Safari/iOS 26+; Firefox 141+ Windows only; Firefox Android behind a flag. |
| I17 | World Bank: 91 % of 10-year-olds cannot read and understand | §1 | External claim | **Holds** | Press release 2026-04-03, URL as cited. |
| I18 | "85 % of Grades 1–3 have difficulty reading" (national commission) | §19 safe claim 2 | External claim | **Unproven** | No source given. Find the EDCOM 2 report page or drop the number. |
| I19 | Ningning is a K-pop stage name | §9 | External claim | **Holds** | aespa member Ning Yizhuo. Keep the firefly clearly original. |
| I20 | Read Along: on-device, offline, no account; Filipino "not confirmed" | §19 | External claim | **Mostly holds** | On-device/offline per launch coverage; web version since 2022. **No Filipino/Tagalog** in any language list found. "No account" unverified. Safe claim: "Read Along does not list Filipino." |
| I21 | Filipino TTS for echo reading | §20 idea | External claim | **Unproven** | Android may have a fil-PH system voice; desktop Chrome has none found. Use pre-recorded teammate audio if echo reading ships. |
| I22 | "Local AI" is the hackathon theme | §0, header | Assumption | **Unproven** | Not on the public event page (which lists no theme). Probably from organizer slides. Keep the "why local" answer regardless. |
| I23 | Required hashtags / form fields | §21 D5, D15 | External claim | **Partly settled** | No hashtags; tag **@cognition and Devin** on X and LinkedIn. Form fields not published. |
| I24 | Whisper behaves well on silence | §3 (auto-stop) | Assumption | **Contradicted (known risk)** | Whisper hallucinates text on silence/noise. Added an energy gate (ADR-0006). |
| I25 | Word Pop: "a short transcription checks it" | §9 | Assumption | **Unproven (risky)** | Single-word clips are where Whisper is weakest. Mitigation: pad clip, compare with fuzzy similarity, and pop anyway after 2 tries (never blocks the child). |
| I26 | Stories may contain numbers | §10 (silent) | Assumption | **Fixed by rule** | Whisper may write "tatlo" as "3". Content rule: spell out numbers (ADR-0005). |
| I27 | Mascot states: 5 | §9 | Decision | **Changed** | Added `thinking` to cover inference time (ADR-0003). |
| I28 | Sentence-level loop over streaming | §3 | Decision | Holds (ADR-0003) | — |
| I29 | Stack: Vite + TS + React, PWA, Vercel | §2, §5 | Decision | Holds (ADR-0002) | — |
| I30 | Progress on device only | §2 #12 | Decision | Holds (ADR-0008) | — |
| I31 | Star thresholds 50/70/90; unclear = half | §2, §8 | Decision | Holds (ADR-0005) | Word mark cut-offs tuned to 0.80 / 0.50 on 32 golden clips (ADR-0011). Star thresholds unchanged. |
| I32 | Under 50 % → 0 stars + kind retry | §15 | Decision | **Settled** | Q4: 0 Stars, but a Sticker for finishing (ADR-0010). |
| I33 | Owner of D6/D7 is the model engineer, but README is content-QA's | §16 vs §21 | Inconsistent (minor) | **Inconsistent** | Resolved: model engineer drafts the facts, content-QA owns the README text. |
| I34 | Git skill requires Eden review per PR | skill §1 | Decision | **Settled** | Q6: Eden does not apply to Kislap. Removed from the skill; one teammate approves (ADR-0009 accepted). |
| I35 | Git skill forbids Co-Authored-By / "Generated with" | skill | Decision | Holds | Applied to every commit and PR in this repo. |

## Fixes applied to `kislap-spec.md`

1. §2 #14 and D5: video goes on **X and LinkedIn**, tagging **@cognition and Devin** (I1, I23).
2. D11: replace "code reused from KitaKo" with "confirm no pre-existing project code is used" (I2).
3. §16: add Demo Day (live pitch, in person) to the timeline (I3). New issues cover it.
4. §5/§7: Transformers.js **v4**, export with **Optimum**, size table, licence caveat, model tiers
   (I4–I8). See the model recommendation below.
5. §19 claim 2: mark the 85 % figure as needing a source (I18).

## Model recommendation (input to grill Q1)

| Tier | Repo | dtype | Download | Use |
|---|---|---|---|---|
| Bootstrap (now → Checkpoint 1) | `onnx-community/whisper-base` | `q8` | ~77 MB | Get the loop working on every device tonight |
| Small (phone / WASM) | `onnx-community/whisper-base` | enc `fp32`, dec `q4` (WebGPU) or `q8` (WASM) | ~206 / ~77 MB | Poco X6 Pro |
| Large (laptop / WebGPU) — option A | `internetoftim/whisper-small-pld-fil-ONNX` | enc `fp32`, dec `q4` | ~586 MB | Filipino fine-tune, **ready today**, no conversion |
| Large — option B | team export of `sapinsapin/whisper-small-fsc` | `q4f16` | ~200 MB | Fits the 300 MB rule; costs 1–2 h of export work |

Both Filipino fine-tunes carry **research / non-commercial data terms**. Kislap is free and
non-commercial, so this is acceptable **if disclosed** in D8 and D11.

## Grill log

Round 1 is in the session summary and in `PROGRESS.md` under "Open decisions". Answers go here:

| Q | Decision | Answer | Date |
|---|---|---|---|
| Q1 | Large-tier model | **Option A**: `internetoftim/whisper-small-pld-fil-ONNX` on the laptop (enc fp32, dec q4, ~586 MB). Bootstrap and phone stay on `onnx-community/whisper-base`. Research-use data disclosed in D8/D11. Own export (#17) stays an optional stretch. | 2026-10-09 |
| Q2 | Social posting (X + LinkedIn) | The user (lead) owns the account and posts on both, tagging @cognition and Devin. | 2026-10-09 |
| Q3 | Demo Day plan and presenter | All four attend. The user brings the demo phone. Every member must be able to run the demo. | 2026-10-09 |
| Q4 | Under-50 % reward | 0 Stars + a Sticker for finishing + kind message (ADR-0010). | 2026-10-09 |
| Q5 | Creative additions to adopt | **All six**: Privacy meter (#6), syllable help (#21), firefly jar (#12), mic-check screen, echo reading with pre-recorded teammate audio, local progress QR. New issues for the last three. | 2026-10-09 |
| Q6 | Eden review tonight | Not related to this project. Removed from the skill; one teammate approves (ADR-0009). | 2026-10-09 |
| Q7 | GitHub usernames for the 4 roles | Lead @Romeo-04 · Designer @Seedlign · Model engineer @acmrsu · Content-QA @emyol. All issues assigned by owner label; @Seedlign's assignments wait on the repo invite. | 2026-10-09 |
| Spike | Flutter instead of the web app? | Delegated as a 45-minute spike, decide by 17:00 (`docs/spikes/flutter-whisper-trial.md`). Web plan continues in parallel. **Result: not run.** `flutter doctor` on the designer's machine: Android cmdline-tools missing, past the 15-minute stop rule. Web app stays (ADR-0002). #48 closed. | 2026-10-09 |
