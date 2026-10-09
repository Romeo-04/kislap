# Kislap

A reading game where a Grade 1–3 child reads a Filipino or Taglish story aloud, one sentence at a
time, and an on-device speech model checks each word. This file is the glossary only. Decisions
live in `docs/adr/`, progress in `PROGRESS.md`.

## Language

### Reading

**Story**:
A short original text at one Level, split into Sentences, with a title in Filipino and English.
_Avoid_: Book, passage, lesson

**Level**:
The difficulty band of a Story: easy, medium, or hard.
_Avoid_: Grade, stage, tier

**Sentence**:
One unit of reading: the text the child reads in one Attempt, about 4 to 10 words.
_Avoid_: Line, page, prompt

**Expected word**:
A word in the Sentence text, after normalization. Scoring is always counted per Expected word.
_Avoid_: Target word, token

**Echo reading**:
The child first hears a Sentence read aloud in a teammate's recorded voice, then reads it.
_Avoid_: TTS, read-aloud (in UI copy)

**Heard text**:
What the speech model wrote down from the child's recording. It is never shown as "what you said
wrong".
_Avoid_: Transcript (in UI copy), output

**Attempt**:
One recording of one Sentence, from tapping the mic to the end of scoring. A child can make many
Attempts on one Sentence.
_Avoid_: Try, take, turn

**Reading session**:
All Attempts on one Story, from the first Sentence to the Result screen.
_Avoid_: Game, round, run

### Scoring

**Word mark**:
The result for one Expected word: correct, unclear, or missed.
_Avoid_: Grade, verdict, error

**Correct**:
A Word mark where the Heard text matches the Expected word closely (similarity ≥ 0.80).

**Unclear**:
A Word mark where the match is partial (0.50 ≤ similarity < 0.80). Worth half credit.
_Avoid_: Wrong, mistake, mispronounced

**Missed**:
A Word mark where the Expected word was not heard or matched poorly (< 0.50). It is a chance to
practise, never a failure.
_Avoid_: Wrong, failed, error

**Accuracy**:
(correct + 0.5 × unclear) ÷ Expected words, for a Sentence or a Reading session.
_Avoid_: Score (in UI copy), grade

**Stars**:
0 to 3, earned per Story from the best Reading session Accuracy (thresholds 50 / 70 / 90 %).

### Rewards and practice

**Ningning**:
The firefly (alitaptap) mascot. Its glow follows the child's Accuracy. Never a tarsier, owl, or
blob.
_Avoid_: Avatar, pet, buddy

**Mascot mood**:
Ningning's current state: idle, listening, thinking, cheering, encouraging, or celebrating.

**Sticker**:
A collectible earned by finishing a Story. A 3-Star finish earns a bonus Sticker.
_Avoid_: Badge, achievement, prize

**Practice word**:
A Missed or Unclear Expected word saved on the device for Word Pop.
_Avoid_: Wrong word, error word

**Syllable help**:
Tapping a word shows it split into syllables (pantig), such as "ba-ta".
_Avoid_: Phonics, spelling help

**Word Pop**:
The mini-game where Practice words float as bubbles and the child says each one to pop it.

**Streak**:
The count of days the child has played. A missed day pauses it; it never resets to zero.
_Avoid_: Chain, daily lives

### Device and privacy

**Offline ready**:
The state where the app shell and the speech model are both stored on the device, so a full
Reading session works with no internet.

**Speech model**:
The Whisper model that runs on the device. There is a large tier (laptop, WebGPU) and a small
tier (phone or no WebGPU).
_Avoid_: AI, API, engine (in UI copy)

**Privacy meter**:
The on-screen counter of network requests that leave the device during a Reading session. It
must read 0. (It counts requests, not bytes: the browser does not report bytes sent.)
