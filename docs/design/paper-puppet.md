# Kislap design system: paper puppet theatre (Claude Design part 2)

Source: Claude Design project "Kislap Design System" (`Kislap Design System.dc.html`, `DESIGN.md`).
This file is the visual source of truth for the paper look. It replaces the candy-adventure look
(`docs/design/candy-adventure.md`) screen by screen, one issue at a time.

Team change on top of the handoff: the cream die-cut edge read as too strong. Ningning's (and the
app icon's) is a third of the handoff's (dilate 3, not 9); the stickers' is half (dilate 4, not 8).

Everything looks cut from craft paper and pinned together: flat pieces with a cream die-cut edge,
lifted off a paper sky by a soft shadow. It is light, flat and warm, not heavy scrapbook texture.

## 1. Principles
1. **Cut paper, not ink.** Shapes are separated by a 4px cream edge (`#FFF3D1`) and a soft shadow,
   never by dark outlines. The only dark lines are icons and small printed details.
2. **Shade with a second cut.** Depth comes from a crescent or strip of the same hue, one step
   darker, laid on top. No gradients.
3. **Light from above.** Every lifted piece has a solid underside, 4 to 5px, in its own darker
   tone, plus a soft blue shadow (`0 10px 16px rgba(27,58,82,.18)`). Pressed pieces sink 4px.
4. **One accent.** Kislap yellow `#FFC93C` is for the single main action per screen and for
   Ningning's light. Nothing else is yellow.
5. **Paper is always readable.** Text sits on cream paper (`#FFFDF6`) or on the day sky in
   chocolate ink. Cards stay cream at night, so contrast is the same day and night.
6. **Joints are brass pins.** Anything that moves on a pivot, like Ningning's wings, is fixed with
   a brass split pin.

## 2. Colour
| Token | Hex | Use |
|---|---|---|
| sky | #84CEF0 | paper sky (day) |
| sky-far | #6AAFD3 | mangrove treeline silhouette |
| cloud / cloud-shade | #FFFFFF / #D9EEF8 | paper clouds, flat bottoms |
| hill-back / hill-front / hill-shade | #5FB548 / #8ACF4E / #7BC144 | layered hills, each with a cream rim |
| paper | #FFFDF6 | cards, sentence card, secondary buttons |
| paper-warm | #FFF8E7 | document panels |
| edge | #FFF3D1 | die-cut edge on every piece |
| edge-deep | #F0DDAE | rules, tracks, empty bars |
| underside | #E3CFA4 | underside of cream pieces |
| ink | #3B2412 | all text and icons |
| muted | #5E4329 | secondary text |
| glow / glow-under / glow-soft | #FFC93C / #E59A12 / #FFE79A | main action, its underside, its highlight |
| leaf / leaf-shade | #8ACF4E / #6DB43E | Ningning's body |
| cap / cap-shade | #F58A2B / #D9701C | Ningning's headband |
| correct / unclear / missed | #2E9A4E / #E9A800 / #F58A2B | word marks |
| brass / brass-hi | #D9A441 / #F6D88A | split pins |
| wood / wood-shade | #C9925A / #A8743F | puppet stick |
| gabi sky / far / hills | #1F3B5C / #2B4E70 / #2F6B45, #3E7E4E | night |

Tokens in code: `src/styles/tokens.css`.

## 3. Typography
- **Baloo 2** (500/700/800): display, titles, buttons, the wordmark.
- **Andika** (400/700): anything a child reads.
- Scale: 14 / 18 / 24 / 32 / 48 / 64 / 80. The reading sentence is 36px on phone and 52px on laptop.
- **Wordmark:** "Kislap" in Baloo 2 ExtraBold, gold with a darker rim and extrusion, on a cream
  paper tag hanging from a twine string, tilted -4° (`src/ui/Wordmark.tsx`).

## 4. Components (`src/ui/`)
- **Candy button (primary):** pill, `#FFC93C`, 4px edge, `0 5px 0 #E59A12` underside, soft drop and a
  cream-yellow inset highlight. Hover `#FFD65C`. Pressed sinks 4px.
- **Paper button (secondary):** the same shape in `#FFFDF6` with a `#E3CFA4` underside.
- **Paper card:** `#FFFDF6`, 4px edge, radius 28, underside plus soft drop.
- **Mic:** 112px candy circle. Recording: pressed in, two glow rings grow with the voice.
  Thinking: a dashed `#A08566` ring, no fill shadow, not tappable.
- **Word marks:** text stays ink. Correct: solid green underline and check. Unclear: wavy underline.
  Missed: dashed orange ring.
- **Stars:** yellow with a darker right half, a cream edge and a highlight. Empty stars are cream
  with a dashed cut line, never grey.
- **Switches:** 60 x 36, track `#F0DDAE` off and `#2E9A4E` on, cream knob; the state is always
  written next to it as a word.
- Disabled is a dashed cut line, never an opacity fade.

## 5. Scene (`src/ui/PaperScene.tsx`)
Back to front: sky, three paper clouds, the mangrove treeline with a kubo, back hill, front hill
(each with a cream rim), a shade band, 9% multiply paper grain. Hill line: high 64% (Home), mid 72%
(Result), low 84% (Reading, Mic check, Jar, Word Pop, Settings), map 24% (Story map). Gabi: navy
sky, paper moon, pinprick stars, three soft fireflies. Screens wrap it in `.paper-stage`.

## 6. Ningning
A paper puppet: a round green body, an orange headband, big round eyes, a small v smile, curly
antennae and a yellow teardrop tail light. Four white paper wings on brass split pins; no arms or
legs. On Home and Result Ningning is held up on a wooden stick. Moods change the eyes, mouth,
antennae and wing angles; the glow (0.3 to 1) follows reading accuracy.

## 7. Spacing, radius, motion
- Spacing 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Radius 12 / 20 / 28 / pill, no square corners.
- Press 120ms, state change 240ms, mood hold 2000ms. Puppet sway ±3° over 3s, tag swing ±2° over 4s.
- Pops use `cubic-bezier(.34,1.56,.64,1)`. With reduced motion everything appears in place.

## 8. Don't
- dark outlines around shapes
- gradients, glass or blur panels
- grey disabled states (use dashed cut lines)
- yellow on anything that isn't the main action
- text on hills without a paper slip under it
- copying another game's characters or art (the style is borrowed, the drawings are ours)
