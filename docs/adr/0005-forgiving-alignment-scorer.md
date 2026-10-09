---
status: accepted
date: 2026-10-09
---

# Score with a forgiving word alignment, never with the raw transcript

We align the Expected words to the Heard text with a word-level edit-distance alignment. The
substitution cost is character similarity. Each Expected word gets a Word mark: correct at 0.85
or more, unclear from 0.60, missed below that. Accuracy gives half credit for unclear. All
thresholds live in one config file. We chose this because the model is weaker on child voices and
on Taglish, and a model error must never cost the child.

## Consequences

- Extra words the child says (fillers like "ano", "ah", repeats) are ignored, never penalised.
- Story text avoids digits and abbreviations, because Whisper may write "tatlo" as "3".
  Normalization also maps a short list of number words and Taglish spellings.
- Changing a threshold after release changes what a Star means (MAJOR in semver).
- The 0.85 and 0.60 cut-offs were replaced by 0.80 and 0.50 in ADR-0011, before the first release.
