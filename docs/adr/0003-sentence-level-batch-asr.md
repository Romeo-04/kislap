---
status: accepted
date: 2026-10-09
---

# Transcribe one sentence at a time, not a live stream

The child records one Sentence. Recording stops on a tap or after about 1.5 s of silence. Then
the whole clip goes to the Speech model, and we score it after transcription. Streaming
recognition with live word highlighting on a phone is too risky for one night. Whisper also works
best on whole utterances, not on short chunks.

## Consequences

- There is a short wait after each Sentence. Ningning shows a "thinking" Mascot mood to cover it,
  and the words light up one by one so the wait feels like part of the reward.
- Live highlighting stays a Could item.
