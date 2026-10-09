# Golden recordings (#18)

Local test clips for tuning the scorer and comparing models. **The audio files are gitignored.**
Only `expected.json` is committed. Never commit a recording of someone who did not agree to it.

## Record

1. Read the clips in `expected.json`. Each one gives the sentence and how to read it (clean, skip a word, and so on).
2. Record each one with any recorder (phone voice recorder, laptop). Aim for 10+ clips and at least 2 different adult readers.
3. Name each file `<clip id>__<reader>.<ext>`, for example `s1-01-clean__marcus.m4a`. Put it in this folder.

## Check

Open `/#/golden`, load the clip files, choose model setups, and tap **Transcribe clips**.
Copy the table and send it to the scorer owner (issue #23).

The table shows the heard text, not an Accuracy yet. Accuracy comes from `scoreReading` once the scorer is on `main`.