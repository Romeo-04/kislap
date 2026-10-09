---
status: accepted
date: 2026-10-09
---

# Finishing a story always earns a Sticker; Stars stay earned by Accuracy

A Reading session under 50 % Accuracy gives 0 Stars, but the child still gets a Sticker for
finishing, with a kind message ("Natapos mo ang kuwento! Subukan natin ulit para sa bituin.").
Stars keep their meaning (50 / 70 / 90 %), and a slow reader never leaves with nothing. This
settles spec §15. The speech model is weaker on child voices, so a low score can be the model's
fault; the Sticker makes sure that a model error never leaves the child empty-handed (spec §20
hard rule 2).

## Considered options

- **0 Stars and no reward**: honest but punishing; a model error could cost the child.
- **At least 1 Star for every attempt**: kind, but makes Stars meaningless for the demo.
