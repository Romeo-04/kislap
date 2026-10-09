---
status: accepted
date: 2026-10-09
---

# Progress is one versioned JSON object in localStorage

Stars, Stickers, Streak, Practice words, the chosen language, and the chosen model tier are saved
as one JSON object under the key `kislap.progress.v1`. We chose localStorage over IndexedDB
because the data is small (a few KB), and synchronous reads keep the first paint simple. The
version in the key lets us migrate later without losing a child's Stickers.

## Consequences

- A shape change without a migration is a MAJOR change (see the git-operations skill).
- Clearing site data deletes progress. There is no backup, by design (ADR-0001).
