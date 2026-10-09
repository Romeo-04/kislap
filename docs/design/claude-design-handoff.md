# Handoff: Kislap UI restyle

## Overview
Kislap is a free, on-device reading game for Filipino children in Grade 1 to 3. This bundle is the new visual identity and every screen: a bubbly, picture-book look in warm white, yellow, orange and green, built around the firefly mascot Ningning. It replaces the current placeholder UI (night purple, emoji mic, generic cards).

The product brief is `docs/design-handoff.md` and the copy rules there still apply: never say "wrong", no timers or lives, finishing always earns a sticker, a missed day pauses the streak.

## About the design files
The files in `designs/` are **design references made in HTML**. They show the intended look and behaviour; they are not production code. Recreate them in the existing Kislap app (React + TypeScript + plain CSS custom properties, no Tailwind, no component library) using its own patterns.

To view them, open any `designs/*.dc.html` in Chrome from the same folder (`support.js` and `strings.js` must sit next to them). Each layer file has a Tweaks panel; layers 1, 3, 5 and 6 have a Language switch (Filipino / English).

The SVGs in `assets/` **are** production-ready and can be shipped as is.

## Fidelity
**High fidelity.** Colours, type, spacing, radii, shadows and copy are final. Match them exactly. Illustration slots marked "cover", "maingay na sala" and "tahimik na sulok" are still placeholders.

## Visual rules (read first)
- Every surface has a **3px tinta (#1E2B1F) outline**. Night mode uses #FFF6DC outlines on cards.
- Depth is a **hard "toy" shadow**: `0 6px 0 #1E2B1F`. Pressed = `translateY(4px)` + `0 2px 0`. No blurred shadows, no gradients, no glass.
- **Yellow #FFC62E is the accent.** It is used for the one main action per screen (Play, mic, Next, chosen language) and Ningning's light. Don't use it decoratively.
- Text inside chips and labels is always tinta on white or yellow. Never tinted text on a tinted background.
- Status is a word, not a dot ("Handa kahit offline", "Bukas / Sarado").
- Hover changes the fill (#FFC62E to #FFD65C, white to #FFF3C4). Never opacity.
- The anti-slop constraint layer is in `anti-slop/SKILL.md` and overrides other guidance.

## Design tokens
```css
:root {
  --bg:#FFFBEF; --surface:#FFFFFF; --fg:#1E2B1F; --line:#1E2B1F; --muted:#56634F;
  --glow:#FFC62E; --glow-soft:#FFE27A; --glow-hover:#FFD65C; --cream-hover:#FFF3C4; --pale-yellow:#FFF3B8;
  --leaf:#7CC35A; --cap:#F07F2A;
  --correct:#2F9E57; --unclear:#E9AE14; --missed:#F07F2A;
  --font-display:"Baloo 2","Andika",sans-serif;   /* 500/700/800 */
  --font-read:"Andika",sans-serif;                /* 400/700 */
  --text-xs:14px; --text-sm:18px; --text-md:24px; --text-lg:32px; --text-xl:48px; --text-2xl:64px; --text-3xl:80px;
  --text-sentence:36px;                            /* 52px at min-width:900px */
  --s-1:4px; --s-2:8px; --s-3:12px; --s-4:16px; --s-5:24px; --s-6:32px; --s-7:48px; --s-8:64px;
  --r-sm:12px; --r-md:20px; --r-lg:32px; --r-pill:999px;
  --stroke:3px; --toy:0 6px 0 var(--line); --toy-pressed:0 2px 0 var(--line);
  --tap-min:48px; --mic-size:112px;
  --t-fast:120ms; --t-base:240ms; --t-mood:2000ms; --ease-pop:cubic-bezier(.34,1.56,.64,1);
}
[data-theme="gabi"] { --bg:#0F2A21; --surface:#173A2E; --fg:#FFF6DC; --muted:#BFD3BC; --line:#06150F; }
@media (prefers-reduced-motion: reduce) { :root { --t-fast:0ms; --t-base:0ms; } }
```
Fonts (both SIL OFL 1.1; self-host woff2, Latin + Latin Extended for ñ):
- **Baloo 2** (Ek Type) for display, buttons and titles.
- **Andika** (SIL) for everything a child reads. It was designed for beginning readers.

Night-mode extras: ground #1F5A3A, shadow #06150F.

## Screens

Phone frame is 390 × 844, with 24px side margins and the top bar starting 48px from the top. All copy comes from `designs/strings.js` (keys below are the keys in that file).

### Home (layer 1, section 3)
- Top row, space-between:
  - LangToggle: 48px pill, white, 3px border, Baloo 700 18, shows the *other* language (`langToggle`).
  - Settings button: 48 × 48, radius 16, gear icon. It opens **Settings** (layer 6).
- Hero, 396px tall:
  - Ningning `idle`, 230px, absolute right −8px, top 12px.
  - Tagline stacked bottom-left: Baloo 800 64/0.92, letter-spacing −1px. Three lines (`tag1/2/3`) indented 0 / 32 / 64px, stepping down like stones. This stepping is the screen's one deliberate oddity. Keep it.
- Play: full width, 88px, pill, yellow, toy shadow, Baloo 800 36, ink play triangle 28 × 32 + `play`.
- Below Play, 20px gap:
  - Ready: green check + `offlineReady` (Andika 700 16).
  - First visit: a 20px progress pill (white track, yellow fill with a 3px ink right edge), then `preparing` and the percentage underneath. Ningning shows `thinking` at glow 0.4 while downloading.
- Riverbank band at the bottom, 150px: a leaf wave with an ink stroke over a darker green wave. On it sits the jar button: 64px tall, radius 24, white, toy shadow, jar icon + `jar` (Baloo 700 20), 28px from the bottom.
- Night version: bg #0F2A21, the tagline's middle word in yellow, cards #173A2E with #FFF6DC borders.

### Story map (layer 3)
- Back button (52 × 52, radius 18, `0 4px 0` shadow) + `mapTitle` (Baloo 800 32).
- A riverbank path climbs from the bottom up, drawn three times: ink stroke 34, then #FFE27A stroke 27, then white dots (dasharray 2 16).
- Three story cards (262px wide, radius 28, padding 14, toy shadow) zig-zag left / right / left at y 146 / 366 / 592, hard at the top and easy at the bottom. Each card has:
  - a 72px cover slot (radius 18)
  - the level word (Baloo 700 15, muted)
  - the Filipino title (Baloo 800 20) and the English title (Andika 14, muted)
  - 3 stars at 26px
- The whole card is the tap target. Nothing is locked.
- Ningning (120px) waits beside the next unfinished story. On tap, the card sinks, Ningning hops along the path (400ms), then Reading opens.

### Reading (layer 3; component `ReadingScreen.dc.html`, states: ready, listening, thinking, reviewed, silence)
- **Top:** back button + progress vine (8 dots on a 4px ink line). Done dots are 16px yellow, the current dot is 24px yellow with a `0 0 0 5px #FFE27A` halo, upcoming dots are 16px white. "2/8" sits beside it in Baloo 700 18.
- **Ningning zone** (214px): Ningning 180px at left 20, top 14. Speech bubble (white, 3px border, radius 24):
  - reviewed: `cheer`, Baloo 800 28
  - silence: `silence`, Baloo 700 19
- **Sentence card:** margin 0 20px, padding 26/22/20, radius 32, white. Andika 400 36/1.5, word gap 6/10. Under it the `listenFirst` pill (48px, #FFFBEF fill, speaker icon). Hidden while listening or thinking.
- **Bottom** (44px padding):
  - ready / silence: mic in idle, with `tapMic` under it (Andika 19)
  - listening: mic recording, with `listening`
  - thinking: mic disabled, with `thinking`
  - reviewed: the mic is replaced by `retry` (secondary, flex 1, 64px) and `next` (primary, flex 1.3)
- **Word states.** Text is always tinta; the state is shown by shape, not colour.

| State | Mark |
|---|---|
| pending | nothing |
| correct | solid #2F9E57 underline, 5px thick, 8px offset, plus an 18px green check at top-right (−4px, −10px) |
| unclear | wavy #E9AE14 underline, 4px thick, 10px offset |
| missed | 3px dashed #F07F2A ring, radius 14, white fill; tappable |

- **Syllable bubble:** opens on tapping a word. It sits to the right of the word, vertically centred: white, 3px border, radius 20, `0 4px 0` shadow, Baloo 800 26, e.g. "har · din".
- **Laptop (≥900px):** two columns.
  - Left column, 460px: back + story title, the vine, Ningning at 320px with a bubble.
  - Right column: sentence card at 52px Andika (radius 40, padding 48), buttons right-aligned at 72px tall.
  - Keyboard: Space toggles the mic, Enter is Next.

### Result (layer 3)
- Static confetti behind everything.
- Title `resultTitle`: Baloo 800 44, left-aligned, 80px from the top.
- Stars arch: 76 / 100 / 76px, with the middle star raised 22px. Earned stars are yellow; empty ones are white outlines.
- 0 stars: `lowStars` centred under the stars.
- Sticker area, 250px:
  - main sticker 130px, rotated −6°, at left 20, top 16
  - 3-star bonus sticker 84px, rotated 8°, at left 132, top 152
  - Ningning `celebrating` 160px at top right (glow 0.75 when 0 stars)
- Then `sticker` (Baloo 800 26) and, on 3 stars, `bonus` (Andika 18).
- Buttons stacked full width at the bottom: a 64px primary on top, a 56px secondary below.
  - 3 stars: primary `more`, secondary `retry`.
  - 0 stars: primary `retry`, secondary `more`.
- Sequence: confetti 900ms, stars pop in 300ms apart, the sticker drops in and settles (400ms, pop ease), and the bonus follows 300ms later.

### Mic check (layer 5; opened from Settings and on the first visit)
- Back + `micTitle` (Baloo 800 26).
- Ningning, 190 to 200px.
- A white card with `say` and "Kumusta, Ningning!" (Baloo 800 40).
- **Level bar:** 36px pill holding 10 segments (5px gap), updated every 80ms. A 4px ink "loud enough" line sits at 62%, with the `quiet` and `enough` labels below.
  - Speaking, below the line: segments fill yellow.
  - Speaking, past the line for 0.5s: all segments turn green, and a check with `clear` appears. Ningning cheers and the `heard` bubble shows.
  - Noise when nobody is speaking: segments are orange, with `noiseOnly`.
- **States:**
  - Listening.
  - Heard you: the primary `done` button (72px) appears.
  - Too noisy: Ningning encourages with the `noisy` bubble. A before/after picture card follows (two illustration slots with an arrow between), then the `retry` button.
  - Mic not allowed: Ningning at 120px with `denied`, then three numbered steps (`step1..3`), each with a small drawing of Chrome's site-settings icon and the Microphone switch, then `retry`.

### Firefly jar (layer 5)
- Back + `jar`.
- After a gap, a one-time `welcome` card (Baloo 700 17).
- The jar (330px area): orange lid, white glass with a 4px ink outline, two #BFD3BC highlight strokes.
  - Earned stickers (76px, slightly rotated) float on #FFE27A glow circles.
  - Not-yet-earned stickers are the `-locked` SVGs.
  - Earned stickers drift a few pixels on 3 to 5s loops.
- Two equal cards below the jar:
  - Streak: a big "3" (Baloo 800 56) + `days`. It counts days read and never resets.
  - Goal: a 44px green ring (1 of 2) + `goal`.
- Stars per story: three rows, Baloo 700 17, with 22px stars.

### Word Pop (layer 5)
- Back + "Word Pop" + `popHint`.
- Bubbles: white circles with a 3px border and an Andika word inside, 100 to 138px. They drift on 8 to 12s loops.
- The current word is a 190px bubble with a 4px border and a `0 0 0 10px #FFE27A` ring, showing its syllables in a small pill.
- Pop: squash to 1.1 (120ms), 5 white bits fly out (300ms), and the word lands on a yellow card with its syllables.
- After 2 tries the bubble pops anyway, and Ningning cheers with the `together` bubble.
- Bottom row: Ningning listening (110px), with the 100px mic and its status centred.

### Settings (layer 6)
- Back + `settingsTitle` (Baloo 800 32).
- Cards are radius 28, padding 18/20.
  - **Language card:** `language` label, then two 64px pills, "Filipino" and "English". Each is always written in its own language. The chosen one is yellow and pressed in. Switching changes the whole UI at once.
  - **Sound** and **Night** rows: at least 72px tall, and the whole row toggles. Each shows its label, the `on`/`off` word, and a 60 × 36 switch (green when on; the knob moves with the pop ease over 240ms). Night switches the app to `[data-theme="gabi"]` straight away.
  - **Mic check row:** a 64px white pill with a mic icon, `micTitle` and a chevron. It opens Mic check.
- Ningning idle, 130px, bottom right.

## Ningning (assets/ningning-*.svg)
- viewBox is 200 × 200.
- Named groups: `#glow`, `#wings`, `#antennae`, `#tail-light`, `#body`, `#eyes`, `#mouth`, `#thought` (thinking only).
- There are no arms or legs. Each mood is carried by the eyes, mouth, antennae and wings.
- Glow is 0.3 to 1.0. `#glow` has two circles: the outer one's opacity is glow × 0.45, the inner one's is glow × 0.7.

| Mood | Default glow | Motion |
|---|---|---|
| idle | 0.6 | bobs 4px every 3s; antennae sway |
| listening | 0.75 | glow follows the mic volume |
| thinking | 0.5 | thought bubbles appear 300ms apart |
| cheering | 0.95 | one hop, 240ms pop ease; hold 2s, then idle |
| encouraging | 0.55 | leans in once; hold 2s |
| celebrating | 1.0 | wings spread; hops in a loop |

With reduced motion, show the static pose only.

- The app icon is `assets/app-icon-512.svg`: Ningning idle at full glow on #0F2A21, radius 116.

## Stickers (assets/sticker-*.svg)
- Six stickers, all original art. Each comes in two versions: earned (`sticker-<name>.svg`) and not yet earned (`-locked.svg`).
- The die-cut white border and ink edge come from an SVG filter (`#kd-cut`: dilate 7 for white, dilate 10 for ink, a 4px ink drop). The locked version uses `#kd-ghost`, a soft #56634F silhouette at 20%.
- If several stickers are inlined on one page, give each filter a unique id.
- Mapping:

| Story | Story sticker | 3-star bonus |
|---|---|---|
| Madali | sampaguita | kubo |
| Katamtaman | alitaptap | kalabaw |
| Mahirap | jeep | parol |

## Interactions and state
- `lang` ('fil' | 'en'): persisted, default 'fil'. The Home toggle and Settings both write it.
- `sound`: boolean, default true. `theme`: 'day' | 'gabi'.
- Reading state machine:
  - ready → tap the mic → listening
  - listening → tap again, or 1.5s of silence → thinking (1 to 4s)
  - thinking → reviewed: words reveal 120ms apart (scale 1 → 1.08 → 1), then Ningning cheers if the score is 70% or more, otherwise encourages
  - if nothing was heard → silence
  - after reviewed or silence, Ulitin goes back to ready; Susunod goes to the next sentence, or to Result after the last
- Mic glow while listening: two halo rings at inset −26px (#FFE27A, opacity 0.55) and −11px (#FFD43B, 0.7), scaled 1 to 1.5 by volume over 80ms.
- After scoring, the mic slides down and fades out (240ms) and the two buttons rise into the same spot.
- Stars: 50%, 70% and 90% accuracy give 1, 2 and 3 stars. Finishing always gives a sticker.

## Copy
`designs/strings.js` holds every interface string in both languages, as an object keyed `fil` / `en`. The full table is also on the layer 6 page.

Several of the original handoff lines were reworded for plainer speech. Notable changes:

| Key | Was | Now |
|---|---|---|
| `offlineReady` (en) | "Offline ready" | "Works offline" |
| `preparing` (en) | "Preparing Kislap for offline use…" | "Getting Kislap ready…" |
| `silence` (fil) | "…Subukan natin ulit!" | "Hindi kita narinig. Ulitin natin!" |
| `lowStars` (fil) | "Subukan natin ulit para sa bituin." | "Basahin natin ulit para sa bituin." |
| `lowStars` (en) | "Let's try again for a star." | "Let's read it again for a star." |

Story text is never translated.

## Removed on purpose
- The "0 bytes sent" privacy meter. Children don't understand it.
- The hint lines under Sound and Night in Settings.

## Files
- `designs/Kislap Layer 1.dc.html`: tokens, Ningning moods, Home (ready / preparing / night)
- `designs/Kislap Layer 2 UI Kit.dc.html`: buttons, mic states and live demo, WordChip, StarRow, LangToggle, OfflineBadge, Confetti (Filipino only)
- `designs/Kislap Layer 3 Screens.dc.html`: Story map, Reading × 5, Result × 2, laptop Reading
- `designs/Kislap Layer 4 Stickers.dc.html`: the sticker sheet and the not-yet-earned state
- `designs/Kislap Layer 5 Should Screens.dc.html`: Mic check × 4, Firefly jar, Word Pop × 2
- `designs/Kislap Layer 6 Settings.dc.html`: Settings and the full copy table
- `designs/Ningning.dc.html`, `designs/Sticker.dc.html`, `designs/ReadingScreen.dc.html`: shared parts
- `designs/strings.js`: all interface copy
- `assets/`: production SVGs (6 Ningning moods, the app icon, 12 stickers)
- `docs/design-handoff.md`: the original product brief
- `anti-slop/SKILL.md`: the visual constraint rules
