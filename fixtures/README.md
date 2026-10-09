# Golden recordings (#18)

Local test clips for tuning the scorer and comparing models. **The audio files are gitignored.**
Only `expected.json` is committed. Never commit a recording of someone who did not agree to it.

## Record

1. Run the app and open `/#/golden`.
2. Type your name. Tap a clip, then read the sentence shown. A file `<clip id>__<name>.webm` downloads.
3. Move the files into this folder. Aim for 10+ clips and at least 2 different adult readers.

## Check

On the same page, load the clip files, choose model setups, and tap **Transcribe clips**.
Copy the table and send it to the scorer owner (issue #23).

The table shows the heard text, not an Accuracy yet. Accuracy comes from `scoreReading` once the scorer is on `main`.
