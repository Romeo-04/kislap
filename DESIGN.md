---
name: Kislap
description: A candy-colored reading adventure with a quiet place to read aloud.
colors:
  candy: "#c62d77"
  candy-light: "#df4c91"
  candy-deep: "#941d5a"
  accent-text: "#b32569"
  pink-soft: "#ffe5ef"
  sky: "#e3f5fb"
  sky-deep: "#bce4f1"
  mint: "#cfedcd"
  mint-deep: "#aad4a7"
  purple: "#7452aa"
  purple-deep: "#563485"
  blue: "#2c84a5"
  blue-deep: "#246781"
  glow: "#ffc94a"
  peach: "#ffebce"
  orange-ink: "#a65a21"
  bg: "#fff9f4"
  surface: "#fffefd"
  fg: "#513653"
  map-ink: "#513653"
  muted: "#79657a"
  line: "#d7c6db"
  white: "#ffffff"
  night-bg: "#231f32"
  night-surface: "#302a42"
  night-fg: "#faf0ff"
  night-muted: "#cec0d6"
  night-line: "#685776"
  night-accent-text: "#ffa9d1"
  night-pink-soft: "#542943"
typography:
  display:
    fontFamily: '"Baloo 2", "Andika", sans-serif'
    fontSize: "clamp(40px, 4.4vw, 60px)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-.025em"
  headline:
    fontFamily: '"Baloo 2", "Andika", sans-serif'
    fontSize: "40px"
    lineHeight: 1.2
  body:
    fontFamily: '"Andika", sans-serif'
    fontSize: "16px"
    lineHeight: 1.6
  reading:
    fontFamily: '"Andika", sans-serif'
    fontSize: "clamp(28px, 4vw, 44px)"
    lineHeight: 1.75
  button:
    fontFamily: '"Baloo 2", "Andika", sans-serif'
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1.3
rounded:
  sm: "12px"
  md: "20px"
  lg: "32px"
  pill: "999px"
spacing:
  s-1: "4px"
  s-2: "8px"
  s-3: "12px"
  s-4: "16px"
  s-5: "24px"
  s-6: "32px"
  s-7: "48px"
  s-8: "64px"
components:
  button-primary:
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "12px 32px"
  button-round:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "50%"
    height: "44px"
  nav-active:
    backgroundColor: "{colors.pink-soft}"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.pill}"
    padding: "12px 16px"
  practice-word:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.map-ink}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
  quiet-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "48px"
---

# Design System: Kislap

## Overview

**Creative North Star: "The Candy Reading Adventure"**

Glossy raspberry controls, rounded type, and a pastel landscape make story selection playful. Reading surfaces give the sentence space, with Ningning and the original Filipino artwork maintaining continuity.

This captures the implemented system in `src/styles/adventure.css`, layered over `tokens.css`. The confirmed user brief takes priority over the older token-file comment saying its values are final. Surface composition and verification history live in `docs/design/candy-adventure.md`.

**Key Characteristics:**

- Tactile controls and numbered story markers.
- Warm neutral reading surfaces and clear large text.
- Local fonts, original artwork, and coordinated day/night themes.

## Colors

Primary raspberry uses candy-light, candy, and candy-deep for glossy controls; accent-text carries readable pink emphasis. Pink-soft supports selected navigation.

Secondary sky and mint build the map landscape. Blue and violet distinguish story markers. Golden glow and peach support stars, earned stickers, and warm activity accents.

Neutral warm cream, near-white surfaces, plum ink, muted plum, and pale lavender borders support the interface. Night mode swaps the surrounding surfaces and text to dark plum and pale lavender; the map retains its own readable ink and lighter landscape.

## Typography

Self-hosted Baloo 2 gives headings, navigation, and controls their rounded character. Self-hosted Andika carries body and reading text. The display role contracts to 44px below 900px and 40px below 420px; quiet-screen headings contract to 32px below 900px. Reading follows the fluid role in the frontmatter. Introductory body copy uses a 41ch measure and 1.8 line height.

## Layout

The outer shell caps at 1280px. Desktop home uses a .85fr/1.15fr split with 48px spacing; at 1050px it uses .9fr/1.1fr and 24px spacing. Below 900px, navigation wraps to a full row and content stacks. Below 420px, outer horizontal padding becomes 16px.

Quiet panels cap at 860px; below 900px they use `calc(100% - 32px)` width and 32px/24px padding. The map is 540px tall on desktop, 580px from 1500px, and 560px on mobile. Mobile story nodes alternate sides with horizontal labels. The expanded map caps at 880px and is 600px tall before the mobile override.

## Elevation & Depth

Depth is structural on controls: a darker lower edge makes pressing legible. Primary controls have an inset highlight plus the candy shadow. Quiet panels use a diffuse ambient shadow. Exact shadows and motion values are in the sidecar; they remain CSS variables in component examples.

Controls lift 2px on hover and press 3px on activation. Story markers lift 6px and rotate -6deg. Reduced-motion mode removes animations and transitions.

## Shapes

Pill controls, circular story markers, and softly rounded panels form the shared vocabulary. Story markers are 72px circles with a 3px pale border; the next story has a dashed outer ring. The home map has an arched upper silhouette, while the expanded map uses the large panel radius.

## Components

- **Primary action:** glossy raspberry gradient, white rounded lettering, 64px minimum height, 2px candy border, and tactile press feedback. Mobile text reduces to 22px below 420px.
- **Round controls:** surface fill, 1px border, minimum 44px width and 44px height; soft pink hover and a 2px press.
- **Navigation:** 18px bold display type; active and hovered links use pink-soft and accent-text. Preserve `aria-current`.
- **Practice words:** 24px bold pill buttons with sky fill; selected words use peach fill and orange border. Preserve `aria-pressed`.
- **Quiet panel:** a restrained surface for the sentence and microphone. Reading text uses the frontmatter reading role, with 32px vertical padding.

Keyboard focus uses a 3px candy outline with 5px offset. Disabled buttons use .55 opacity and the not-allowed cursor. The sidecar contains five compact, framework-independent component examples.

## Do's and Don'ts

- Do keep the reading sentence visually dominant on a quiet surface.
- Do retain original Ningning and sticker artwork and self-hosted fonts.
- Do preserve keyboard focus, selected-state semantics, and reduced motion.
- Don't invent story locks, progress, or earned rewards for visual effect.
- Don't apply map decoration behind reading text.

Reviewed implementation evidence: `.playwright-mcp/home-1440.png`, `home-390.png`, `reading-390.png`, and `night-390.png`; independent review disposition: ship.
