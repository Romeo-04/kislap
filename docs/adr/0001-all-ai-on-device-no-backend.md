---
status: accepted
date: 2026-10-09
---

# All AI runs on the device; Kislap has no backend

Speech recognition, scoring, and progress all run in the child's browser. There is no API server,
no account, no analytics, and no cloud inference. The hosting (Vercel) serves static files only.
We chose this because a child's voice is sensitive data and because the hackathon theme (Local
AI) requires that meaningful AI runs locally. It also lets a judge prove the claim with the
browser network tab.

## Consequences

- Features that need a server are out: teacher dashboards, shared leaderboards, cloud sync,
  parent accounts. Export of progress, if built, is a local file or QR code.
- Any new dependency that phones home (analytics, error reporting, Google Fonts, CDN scripts)
  breaks this ADR. See ADR-0007.
