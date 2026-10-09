# Kislap ✨

**Basa. Kislap. Galing!** — Kislap is a free reading game for Filipino children in Grade 1 to 3.
The child reads a short story aloud. A speech model runs **in the browser, on the child's own
device**, and marks each word. Ningning the firefly reacts, and the child earns stars and
stickers.

> Status: in development for AppBuildersPH Hackathon 2026 (Local AI). See `PROGRESS.md`.

## What runs locally

Speech recognition (Whisper, through Transformers.js), word scoring, game logic, progress
storage, mascot, and sounds. **No audio and no text leaves the device.**

## What needs internet

- The first load of the app from Vercel.
- The first download of the speech model from Hugging Face.

Nothing else. After the first load, the app works with Wi-Fi off.

## Why does this product benefit from running AI locally?

_Draft (D13, owned by the lead, reviewed by content-QA):_ A child's voice is sensitive data.
Kislap processes it on the device. It never goes to a server. After the first download, the app
works with no internet, in places with weak signal.

## Project docs

| File | What it holds |
|---|---|
| `kislap-spec.md` | Full implementation spec |
| `CONTEXT.md` | Domain glossary |
| `PROGRESS.md` | Progress, owners, checkpoints |
| `docs/architecture.md` | Architecture and module contracts |
| `docs/uml/` | UML diagrams (Mermaid) |
| `docs/adr/` | Architecture decision records |
| `docs/validation.md` | Spec validation and grill log |

## Additions beyond the spec

_(Spec §20: one or two lines per change — what changed and why.)_

- Energy-based silence gate before transcription, so Whisper does not invent text from silence (ADR-0006).
- Live "0 bytes sent" privacy meter during reading (ADR-0007).
- Finishing a story always earns a sticker, even with 0 stars (ADR-0010).
- Syllable help, firefly-jar stickers, mic-check screen, echo reading (teammate voice recordings, not TTS), and a local progress QR code (grill Q5).

## Disclosures

_To be completed by D6–D12 before submission: models, technologies, services, assets, AI tools._
