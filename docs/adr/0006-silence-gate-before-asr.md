---
status: accepted
date: 2026-10-09
---

# Gate each recording with an energy check before it reaches Whisper

Before a clip goes to the Speech model, we measure its loudness (RMS energy). If the clip is near
silence, we skip transcription, and Ningning kindly asks the child to try again. The same meter
drives auto-stop after about 1.5 s of silence and the mic-check screen. Whisper is known to
invent text from silence or noise. An invented sentence could mark words for no reason.

## Considered options

- **A neural VAD model (for example Silero)**: more accurate, but one more model download and one
  more integration risk before Checkpoint 2.
