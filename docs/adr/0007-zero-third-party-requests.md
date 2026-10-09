---
status: accepted
date: 2026-10-09
---

# Zero network requests during reading, shown by an on-screen Privacy meter

After the first load, the app makes no network request during a Reading session. Fonts, sounds,
images, and the mascot are self-hosted and precached by the service worker. Transformers.js
caches the Speech model in the browser Cache API. The service worker does not precache it,
because the files are larger than Workbox's default size limit. The app asks for persistent
storage (`navigator.storage.persist()`) so the browser is less likely to evict the model. A
small Privacy meter reads the Resource Timing API and shows the bytes sent during the session.
It must read 0.

## Consequences

- No Google Fonts, no analytics, no CDN scripts, no error-reporting service.
- The "Download for offline" button re-runs the model download if the browser evicted the cache.
- The demo video shows the Privacy meter next to the browser network tab.
