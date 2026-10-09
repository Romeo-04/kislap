---
status: accepted
date: 2026-10-10
---

# Scorer cut-offs 0.80 and 0.50, and a separate threshold for spacing errors

ADR-0005 set the Word mark cut-offs at 0.85 (correct) and 0.60 (unclear). On 24 clean readings of the
final stories (one adult, laptop), those cut-offs gave 77 % mean Accuracy with `whisper-base` q8 and
79 % with fp16, and 3 of 24 clean sentences earned 0 Stars. A phone check showed the same kind of
over-strict marking. We change the cut-offs to **0.80 and 0.50**, which gave 83 % for both models, and
1 clean sentence with 0 Stars. We add a third setting, **`spacing` = 0.85**, for the scorer's split and
join moves ("story time" heard as "storytime").

## Why a separate `spacing` setting

The split and join moves accept a joined or split word only when it matches closely. They used the
`correct` cut-off. Lowering `correct` to 0.75 made them accept a skipped short word as a join with its
long neighbour ("ningning" + "ay" against "ningning" is 0.80), so a word the child never said was
marked correct. Keeping `spacing` at 0.85 makes that impossible at any `correct` value we would pick.
Two tests guard this.

## What we checked

Run against the real scorer on 32 clips (24 clean, 8 with one deliberate mistake). At 0.80 / 0.50:

- Skipped words ("pala", "tuyong", "malalim") were still marked missed.
- A wrong sound ("pusga" for "pusa", "sampita" for "sampaguita") stayed unclear.
- A wrong sentence earned a Star 1 % of the time, the same as before.
- 0.75 / 0.45 added about one point of Accuracy but marks "bata" for "bato" (a different word) correct.
  At 0.80 a four-letter word one letter away stays unclear.

## Limits

One reader, 32 clips, and the cut-offs were chosen on the same clips. A second voice is still needed
(issue #78). The Star thresholds (50 / 70 / 90) do not change.

## Consequences

- Stars are a little easier to earn. ADR-0005 counts a threshold change after release as MAJOR; nothing
  has been released yet, so this lands before `1.0.0`.
- One wrong letter in a word of five or more letters counts as correct. In a word of four it is
  still unclear.
- The trade-off: the scorer cannot tell a slip from a different real word. A different word one
  letter away from a word of five or more letters is also marked correct ("sana" for "sanga",
  "buhay" for "bahay"). Tests pin this. We accept it because the model mishears child voices more
  often than a child reads a near-twin word, and a model error must never cost the child.