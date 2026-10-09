# Golden recordings (#18)

Local test clips for tuning the scorer and comparing models. **The audio files are gitignored.**
Only `expected.json` is committed. Never commit a recording of someone who did not agree to it.

## Record

1. Read the sentences in `expected.json`, one clip per sentence.
2. Record each one with any recorder (phone voice recorder, laptop). m4a, mp3, wav, and webm all work. Aim for 10+ clips and at least 2 different adult readers.
3. Name each file `<clip id>.<ext>`, for example `story-1-1.m4a`. To tell readers apart, add the name after two underscores: `story-1-1__marcus.m4a`.
4. Keep the files in any folder. The check page lets you pick them. They need not live in this folder.

The sentence text in `expected.json` is a copy from `src/content/stories.json`. If the story text changes, record the new sentences and rebuild `expected.json`.

## Check

Open `/#/golden`, load the clip files, choose model setups, and tap **Transcribe clips**.
Copy the table and send it to the scorer owner (issue #23).

The table shows the heard text, not an Accuracy yet. Accuracy comes from `scoreReading` once the scorer is on `main`.