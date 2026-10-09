# Kislap design handoff (for Claude Design)

Read this whole file before you draw anything. It holds everything the team has decided about the
product, the screens, the copy and the rules. Where it says "open", you choose.

Timeline: today is 2026-10-09, Asia/Manila. The core screens must exist on fake data by 19:00.
All design work stops at 01:00 on Oct 10. A separate Claude Code session builds the screens in
React at the same time, so send each piece back as soon as it is ready. Do not wait to finish
everything.

---

## 1. The product

**Kislap** (Filipino for "sparkle") is a free reading game for Filipino children in Grade 1 to 3
(about 6 to 9 years old). The child reads a short story aloud, one sentence at a time. A speech
model runs on the child's own device and marks each word. A firefly mascot named **Ningning**
reacts. The child earns stars and stickers.

- Tagline: "Basa. Kislap. Galing!" (Read. Sparkle. Great!)
- English descriptor: "Kislap: your reading buddy that listens on your device."
- Problem: the World Bank says 91% of 10-year-olds in the Philippines cannot read and understand
  an age-appropriate text (April 2026).
- Why it runs on the device: a child's voice is sensitive data. It never leaves the phone. No
  account, no server, no leaderboard. After the first load it works with no internet.
- Hackathon: AppBuildersPH 2026, Local AI theme. Judges open a web link on a laptop or phone.

## 2. Who uses it and where

- A child aged 6 to 9 who is still learning to read. Big targets, few words on screen, pictures
  over text.
- A parent or teacher sitting next to them, often on a mid-range Android phone in a noisy home or
  classroom, sometimes with weak or no signal.
- Demo devices: a laptop with Chrome (main) and a Poco X6 Pro phone with Chrome (second).
- Portrait phone first. It must also look right on a laptop screen.

## 3. Tone (hard rules)

- Kind, always. Never say "wrong", "mistake", "failed" or "error" to the child.
- No timers, no lives, no countdowns, no leaderboards, no losing. A slow reader must never feel
  punished.
- A missed word is "a chance to practise", never a failure.
- Finishing a story always earns a sticker, even with 0 stars.
- A missed day pauses the streak. It never resets to zero.

## 4. Brand direction

What is decided:

- The name Kislap and the mascot Ningning, a firefly (alitaptap).
- Night and light. Ningning's glow is the main visual idea: the better the child reads, the
  brighter Ningning glows.
- Filipino-first. Filipino is the default interface language; English is a toggle.

What is open (you decide, and say why in one line each):

- Palette, type, illustration style, layout system, motion style.
- Setting for the story map. A suggestion from the team: a night-sky or rice-field path with
  fireflies. You may pick something else that fits.

Current placeholder colours in the code. You may keep, change, or throw them away:

| Token | Value | Use |
|---|---|---|
| `--bg` | `#14122b` | night background |
| `--fg` | `#fdf8e8` | main text |
| `--muted` | `#b9b4d6` | secondary text |
| `--glow` | `#ffd84d` | Ningning's light, primary button |
| `--correct` | `#3ccf7a` | correct word |
| `--unclear` | `#f2c94c` | unclear word |
| `--missed` | `#f2994a` | missed word |

The current build looks generic and AI-made. Avoid these specifically:

- Purple-to-blue gradients, glassmorphism, soft drop shadows on every card.
- Inter, Poppins or system-ui as the only typeface.
- Emoji as icons (the mic button is currently a microphone emoji; replace it).
- Everything centred in one column of identical rounded cards.
- Sparkle or star icons sprinkled for decoration.
- Generic "friendly" blob illustrations.

It should feel like a children's picture book made by people in the Philippines, not like a
SaaS dashboard with a mascot pasted on.

## 5. Ningning the mascot

An original, friendly firefly. Its tail light is its glow.

Do not make it look like any of these:

- A tarsier (too close to an existing finance-app brand).
- An owl (Duolingo).
- A bird named Maya (an e-wallet brand).
- A blue blob or an octopus (Bebol).
- Diya from Google Read Along.
- aespa's Ningning (K-pop singer with the same name). No real person's look, photos or fan-art
  style.

Six moods, each needs its own pose or expression:

| Mood | When |
|---|---|
| `idle` | Waiting. Default. |
| `listening` | Mic is on, the child is reading. |
| `thinking` | The model is working on the sentence (about 1 to 4 seconds). |
| `cheering` | Sentence scored at 70% or more. Lasts 2 s, then back to idle. |
| `encouraging` | Sentence under 70%, or the app heard silence. Lasts 2 s. |
| `celebrating` | Story finished, on the Result screen. |

Glow: brightness from 0.3 (dim, never fully dark) to 1.0 (full), driven by the reading accuracy.

Technical needs:

- SVG, so the glow and the parts can be animated with CSS.
- Name the groups (for example `#body`, `#wings`, `#eyes`, `#mouth`, `#tail-light`) so the code can
  swap expressions and drive the glow without changing the drawing.
- A reduced-motion version: the mood still reads from the pose, with no movement.
- Also needed: an app icon (512 x 512, rounded square) using Ningning.

## 6. Screens

All text comes from the copy tables in section 7 (keys in `code` font). No hard-coded strings.

### Must, by 19:00

**Home**
- Ningning (idle) as the hero.
- Tagline.
- Big Play button (`home.play`).
- Language toggle (shows the other language's name: `lang.toggle`).
- Offline badge: "Offline ready" (`home.offlineReady`) when ready. On first visit it is a progress
  bar with `home.preparing` while the speech model downloads (77 MB on phones, about 586 MB on the
  laptop, so this can take a minute or more).
- Entry to the sticker jar (Progress) and a settings icon that opens Mic check.

**Story map** (`map.title`)
- Three stories: easy, medium, hard (`level.easy`, `level.medium`, `level.hard`).
- Each shows its title in Filipino and English, and 0 to 3 stars earned.
- No story is locked.

**Reading**
- One sentence at a time, in a big font (at least 28 px; bigger is better on phones).
- Progress through the story (for example 3 of 8), shown as a picture, not just numbers.
- Ningning, showing its current mood.
- A big round mic button (at least 96 px). Its glow follows the live mic volume while recording.
  Tap to start, tap again to stop. It also stops by itself after 1.5 s of silence.
- Status line under the mic: `reading.tapMic`, `reading.listening`, `reading.thinking`.
- After scoring, the words light up one by one, about 120 ms apart. Four word states:

| State | Meaning | Colour (placeholder) | Also needs |
|---|---|---|---|
| pending | not scored yet | `--fg` | nothing |
| correct | read well | green | an icon or mark, not only colour |
| unclear | partly heard, half credit | yellow | a different icon or underline |
| missed | not heard | orange | a different icon or underline |

  The three result states must be told apart without colour (colour-blind children and parents).
  Orange, not red, for missed: red reads as "wrong".
- Then two buttons: Try again (`reading.retry`) and Next (`reading.next`).
- Silence case: Ningning looks encouraging and shows `reading.silence`.
- Tapping a word shows it in syllables (pantig), for example "ba-ta". Should-level, but leave
  room for it.

**Result**
- Title `result.title`.
- 0 to 3 stars (thresholds 50%, 70%, 90% accuracy).
- Confetti.
- A sticker, always (`result.sticker`). A 3-star finish gets a bonus sticker.
- Under 50%: 0 stars plus `result.lowStars`. It must still feel like a win.
- Ningning celebrating.

### Should, by 01:00

**Mic check** (first visit, and from the settings icon)
- The child says "Kumusta, Ningning!" (`miccheck.say`).
- A live level bar that turns green when the voice is loud enough. Ningning answers when speech
  is heard.
- Too-noisy room: a kind tip to move somewhere quieter.
- Mic denied: a picture guide showing how to allow the mic in Chrome (`mic.denied`).

**Sticker jar / Progress** (`progress.title`: "Ang aking garapon" / "My firefly jar")
- A glass jar (garapon). Each sticker earned is a firefly inside it. Locked ones show as faint
  outlines.
- Streak in days, with a "welcome back" message after a gap. Never a loss.
- A daily-goal ring.
- Stars per story.

**Word Pop** (`wordpop.title`)
- Practice words (missed or unclear words saved from reading) float as bubbles.
- The child says the word to pop it. After 2 tries it pops anyway with a kind line.
- Tap a bubble to see its syllables.

**Privacy meter** (small, during Reading)
- A small counter that reads "0 bytes sent" during a reading session. It proves nothing leaves
  the device. Quiet, not alarming.

**Echo reading** (on Reading)
- A "listen first" button that plays the sentence in a teammate's recorded voice before the child
  reads it.

## 7. Copy we have (Filipino / English)

Stories are not written yet; the content owner delivers them (issue #19). Use these sample
sentences in mocks:

- Easy, "Ang Maliit na Pusa" / "The Little Cat": "Si Mimi ay isang maliit na pusa." "Mahilig
  siyang maglaro sa hardin."
- Taglish sample: "Nag-basketball kami kahapon sa plaza."
- Stories are 6 to 10 sentences, each 4 to 10 words.

Interface strings:

| Key | Filipino | English |
|---|---|---|
| `app.tagline` | Basa. Kislap. Galing! | Read. Sparkle. Great! |
| `home.play` | Maglaro | Play |
| `home.offlineReady` | Handa kahit offline | Offline ready |
| `home.preparing` | Inihahanda ang Kislap… | Preparing Kislap for offline use… |
| `lang.toggle` | English | Filipino |
| `map.title` | Pumili ng kuwento | Pick a story |
| `level.easy` | Madali | Easy |
| `level.medium` | Katamtaman | Medium |
| `level.hard` | Mahirap | Hard |
| `reading.tapMic` | Pindutin ang mikropono at basahin | Tap the mic and read |
| `reading.listening` | Nakikinig si Ningning… | Ningning is listening… |
| `reading.thinking` | Nag-iisip si Ningning… | Ningning is thinking… |
| `reading.next` | Susunod | Next |
| `reading.retry` | Ulitin | Try again |
| `reading.silence` | Hindi kita narinig. Subukan natin ulit! | I didn't hear you. Let's try again! |
| `result.title` | Natapos mo ang kuwento! | You finished the story! |
| `result.lowStars` | Subukan natin ulit para sa bituin. | Let's try again for a star. |
| `result.sticker` | May bago kang sticker! | You got a new sticker! |
| `mascot.cheer` | Galing! | Great job! |
| `mascot.encourage` | Subukan natin ulit! | Let's try again! |
| `wordpop.title` | Word Pop | Word Pop |
| `progress.title` | Ang aking garapon | My firefly jar |
| `miccheck.say` | Sabihin: "Kumusta, Ningning!" | Say: "Kumusta, Ningning!" |
| `nav.back` | Bumalik | Back |
| `mic.denied` | Kailangan ni Ningning ang mikropono para makinig. | Ningning needs the microphone to listen. |

If a screen needs a string that is not here, add it to your output with a key, a Filipino line
and an English line. Filipino text runs about 20 to 30% longer than English, so leave room.

## 8. Stickers and sound

- At least 6 stickers, original art, Philippine themes. Ideas: fireflies, jeepney, sampaguita,
  bahay kubo, kalabaw, parol. One per story plus 3-star bonuses.
- Sounds (word reveal, star, sticker, bubble pop) are short and soft, with a mute toggle.
- All art plus sound must total under 2 MB, so it can be stored for offline use.

## 9. Constraints from the build

- Built with React, TypeScript and plain CSS with custom properties. No Tailwind, no component
  library.
- Fonts must be self-hosted (the app makes zero network requests after first load). Pick a font
  with an open licence (OFL) that we can bundle, and that handles Filipino text, including "ñ"
  and the "ng" and "mga" words.
- Every button and tap target is at least 48 x 48 px.
- High contrast text. Respect `prefers-reduced-motion`.
- Animations are CSS or SVG only. No Lottie, no video.
- Every asset must be our own or free-licensed, with its source written down.

## 10. What to send back, in this order

Send each item when it is ready; the build session picks them up one at a time.

1. **Design tokens**: a CSS block of custom properties on `:root` (colour, type scale, spacing,
   radius, motion durations), plus the font choice and its licence. Keep the seven token names in
   section 4 if you can, and add more as needed.
2. **UI kit**: Button (primary, secondary), mic button (idle, recording with live glow, disabled
   while thinking), WordChip (pending, correct, unclear, missed), StarRow (0 to 3), LangToggle,
   OfflineBadge (downloading with progress, ready), Confetti.
3. **Ningning**: SVG with the six moods and named groups (section 5), plus the app icon.
4. **Screens**: Home, Story map, Reading (ready, listening, thinking, reviewed, silence), Result
   (3 stars, 0 stars). Phone portrait first, then one laptop layout.
5. **Stickers** (6 or more) as SVG.
6. **Should screens**: Mic check, Sticker jar, Word Pop.

For each screen, add a short note on layout, spacing, and any motion (what moves, how long).
