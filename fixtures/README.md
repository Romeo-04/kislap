# Golden recordings (#18)

Local test clips for tuning the scorer and comparing models. **The audio files are gitignored.**
Only `expected.json` is committed. The golden reads (`*_marcus` clips) were recorded by Marcus Ceasar Austria; the same reads drive the word marks in the launch video. Never commit a recording of someone who did not agree to it.

## Record

1. Read the sentences in `expected.json`. The 24 `story-N-K` clips are clean reads. The 8 clips with a suffix (`-skip`, `-wrong`, `-stumble`, `-repeat`, `-noisy`) each hold one deliberate mistake, described in the file. Record the clean set first and do not mix the two.
2. Record each one with any recorder (phone voice recorder, laptop). m4a, mp3, wav, and webm all work. Aim for 10+ clips and at least 2 different adult readers.
3. Name each file `<clip id>_<reader>.<ext>`, for example `story-1-1_marcus.m4a`. One or two underscores both work. The clip id is in `expected.json`.
4. Keep the files in any folder. The check page lets you pick them. They need not live in this folder.

The sentence text in `expected.json` is a copy from `src/content/stories.json`. If the story text changes, record the new sentences and rebuild `expected.json`.

## Check

Open `/#/golden`, load the clip files, choose model setups, and tap **Transcribe clips**.
Copy the table and send it to the scorer owner (issue #23).

The table shows the heard text only. The page does not score it. To get Accuracy, run `scoreReading` from `src/scoring/score.ts` on each row.