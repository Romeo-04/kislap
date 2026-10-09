# Demo Day kit

**Where:** Cyberzone, SM Makati · **When:** Saturday, Oct 10, 13:00–19:00 · **Who:** all four.
Finalists pitch and demo live. Plan for **no venue Wi-Fi** and a **noisy room**. Kislap works
offline by design, so a dead network is part of the demo, not a risk.

## 1. Stage roles

| Person | On stage | Backup for |
|---|---|---|
| @Romeo-04 (lead) | Speaks the pitch. Holds the Poco X6 Pro. | Anyone |
| @emyol (content-QA) | Reads the story aloud on the laptop (a teammate reads; no child on stage). | Romeo's pitch |
| @Seedlign (designer) | Drives the slides and the screen share. Starts the fallback video if needed. | Reader |
| @acmrsu (model engineer) | Answers model and on-device questions (see §5). | Slides |

**Every member must be able to run the whole demo alone.** Rehearse it once with each person
driving.

## 2. The 3-minute pitch

| Time | Say | Show |
|---|---|---|
| 0:00–0:25 | "The World Bank says 91 percent of 10-year-olds in the Philippines cannot read and understand an age-appropriate text. Practice needs a listener, and most children read alone." | Title slide: Kislap, Ningning |
| 0:25–0:45 | "Kislap is a reading game. The child reads a Filipino or Taglish story aloud. A speech model on the device listens and marks each word." | Home screen: "Handa kahit offline" |
| 0:45–1:00 | "First, we turn off the internet." | **Switch Wi-Fi off on the laptop and the phone, on camera.** |
| 1:00–1:45 | (Reader reads two sentences. Words light up. Ningning reacts.) "Green is correct, yellow is unclear, orange is missed. It never says wrong." | Reading screen, live |
| 1:45–2:05 | "Nothing left the device. This counter shows it. You can check the network tab yourself." | **Privacy meter: 0 requests.** Open DevTools → Network, empty. |
| 2:05–2:25 | Finish the story. "Stars, a sticker for every finished story, and the missed words come back in Word Pop." | Result screen, confetti, sticker |
| 2:25–2:50 | "Why local? A child's voice is sensitive data. It stays on the device. And it works where the signal is weak." | Slide: why local |
| 2:50–3:00 | "Open, Filipino-first, no account, no upload. Open the link once, and it works offline." | Slide: kislap.vercel.app + QR code |

**Honest-claims rules (spec §19):** do **not** say "first", "most accurate", or "works for every
child's voice". Say "Filipino-first" and "Read Along does not list Filipino" (not "no one supports
Filipino"). No therapy or diagnosis claims.

## 3. Pre-flight checklist

### The night before (after the final build)

- [ ] Laptop: open https://kislap.vercel.app, wait for **Handa kahit offline**, read one sentence.
- [ ] Poco X6 Pro: same. Also **Add to Home screen** (an installed PWA is less likely to lose its cache).
- [ ] Both devices: Wi-Fi **off**, reload, finish one story. If either fails, fix before sleeping.
- [ ] Reset progress on both (DevTools → Application → Local storage → delete `kislap.progress.v1`), so the demo starts with 0 stars.
- [ ] Fallback video copied to the laptop desktop **and** a USB stick. It plays with no internet.
- [ ] Slides exported to PDF on the laptop (no cloud slides).

### At the venue (30 minutes before)

- [ ] Do **not** clear the browser or update Chrome.
- [ ] Wi-Fi off on both devices; open Kislap; confirm the badge.
- [ ] Mic test in the room at `/#/mictest`: speak at stage volume; the clip must say **speech**, and silence must say **SILENCE**. If the room is too loud, use the wired headset mic.
- [ ] Screen mirroring works for the laptop, with the reader's voice audible.
- [ ] Phone at full brightness, Do Not Disturb on, charged above 80 %.

## 4. If something fails on stage

| Problem | Do this |
|---|---|
| Model not ready ("I-download…" shows) | Switch to the other device. If both, play the fallback video and keep talking. |
| The room is too loud and words come out orange | Reader holds the mic closer / uses the headset. Say: "The scoring is forgiving on purpose, and finishing a story always earns a sticker." |
| Mic permission prompt | Tap Allow. Rehearse this once so it is not a surprise. |
| Browser crash or freeze | Reopen the installed app from the home screen. It loads offline. |
| Projector or screen share fails | Hand the phone to the nearest judge and let them read. |
| Anything else for more than 20 seconds | Fallback video. Do not debug on stage. |

## 5. Likely judge questions

| Question | Answer (keep it true) |
|---|---|
| Which model? | Whisper, open weights. On the laptop a Filipino fine-tune (`whisper-small-pld-fil`), on phones Whisper-base. It runs in the browser through Transformers.js with WebGPU. |
| How accurate is it on children? | We have not measured it on children, and we know of no public Filipino child-speech dataset. That is why the scoring is forgiving and a model error never leaves the child with nothing: finishing a story always earns a sticker. |
| Why not just use a cloud API? | The child's voice would leave the device, and it would not work offline. Kislap runs with zero requests while reading. |
| How big is the download? | About 77 MB on phones and about 590 MB for the Filipino model on laptops, once. After that, nothing. |
| How is this different from Google Read Along? | Read Along is excellent and also on-device. Kislap is Filipino and Taglish first, opens from a link with no install, and uses open, swappable models. |
| Licences? | The Filipino fine-tune was trained on research-use data (UP-DSP PLD). Kislap is free and non-commercial, and we disclose it. |
| What is next? | More stories, teacher-written stories that stay on the device, and testing with real classrooms with parent consent. |

## 6. Travel

- [ ] Leave by **11:30** for a 13:00 start. Confirm the route the night before.
- [ ] Bring: laptop + charger, Poco X6 Pro + charger, power bank, USB stick (video + PDF), wired headset mic, HDMI/USB-C adapter, extension cord.
- [ ] Everyone has the repo link and the live link saved offline (screenshot).
