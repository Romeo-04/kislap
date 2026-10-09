---
status: accepted
date: 2026-10-09
---

# Whisper runs in a Web Worker, with a large and a small model tier

The Speech model runs in a dedicated Web Worker through Transformers.js, so the UI never freezes.
At start-up the app picks a tier. **Large** is the Filipino fine-tune on WebGPU, used when WebGPU
is available and the device passes a quick benchmark. **Small** is a pre-converted Whisper base
or tiny on WebAssembly, used otherwise. The tier is saved on the device so the child waits for
the benchmark only once. A hidden `?tier=small|large` URL flag overrides it for testing and the
demo.

## Considered options

- **One model for every device**: simpler, but either the phone gets a model that is too slow or
  the laptop gets one that is too weak for the demo.
- **Main-thread inference**: freezes animations and the mic button during transcription.

## Consequences

- The worker owns the model. The UI only talks to `transcribe.ts` (see `docs/architecture.md`).
- The scorer must be forgiving enough for the small tier (ADR-0005).
- `docs/validation.md` records the exact repo IDs, dtypes, and sizes once verified.
