---
status: accepted
date: 2026-10-09
---

# Ship as a PWA (Vite + TypeScript + React), not a native or Flutter app

Kislap is a web app installable as a PWA, built with Vite, TypeScript, and React. A judge opens a
link; no app store and no install. Transformers.js gives us Whisper in the browser with WebGPU
and a WebAssembly fallback. That is the shortest path to on-device speech recognition in the
time we have (about 17 hours).

## Considered options

- **Flutter / native Android**: better device access, but no ready on-device Whisper path for
  this team in one night, and judges would need to sideload an APK.
- **Plain TypeScript, no React**: smaller bundle, but the designer and lead are faster in React.

## Consequences

- The microphone needs HTTPS, so Vercel is part of the dev loop from the first hour.
- Speed depends on browser WebGPU support. ADR-0004 covers the fallback.
