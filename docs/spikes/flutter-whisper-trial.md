# Spike: Can Flutter run Whisper on the Poco X6 Pro tonight?

**Owner:** _(name)_ · **Timebox:** 45 minutes of hands-on work. **Decide by 17:00 (Asia/Manila), Oct 9.**
**Main plan does not wait for this.** The team keeps building the web app (ADR-0002) in parallel.
If this spike fails or runs over time, stop and report. That is a useful result.

## The question

Can a Flutter Android app record one Filipino sentence and transcribe it **on the phone**,
with no internet, fast enough for a child (≤ 4 s for a 4 s sentence)?

If yes, we compare it with the web app at Checkpoint 1 (19:00). If no, we close the question.

## Rules you must keep

- **No cloud.** The model runs on the phone. No API calls.
- **Build it from scratch tonight.** The event rule says no pre-existing project code. Public
  packages are fine, but list them.
- **Work outside the main app.** Use a separate folder (`spikes/flutter-whisper/`) on the branch
  `feat/flutter-whisper-spike`. Do not touch `src/`.
- Stop at the timebox. Do not "just fix one more build error" past 17:00.

## Steps

1. **Set up (≤ 10 min).** Flutter SDK, Android SDK + NDK, Poco X6 Pro in USB debugging mode.
   `flutter doctor` must be clean. If setup alone takes more than 15 minutes, stop and report
   "toolchain not ready". That is the answer.
2. **Pick a Whisper binding (≤ 5 min).** Check pub.dev for a maintained package that wraps
   **whisper.cpp** or **sherpa-onnx** for Android. Pick the one with the newest release and an
   Android example. Write down its name and version. (Verify on pub.dev; do not trust names from
   memory.)
3. **Use a stock model first (no conversion).** Download a multilingual whisper.cpp model,
   `ggml-base.bin` or a quantized `ggml-base-q5_1.bin`, from the whisper.cpp model repo on
   Hugging Face. Bundle it or copy it to the phone once.
4. **Record and transcribe.** One screen: a mic button, record ~4 s (16 kHz mono WAV), run Whisper
   with `language = "tl"` (Tagalog), show the text and the time it took.
5. **Test with Wi-Fi and mobile data OFF.** Read these three sentences aloud, 2 times each:
   - "Si Mimi ay isang maliit na pusa."
   - "Mahilig siyang maglaro sa hardin."
   - "Nag-basketball kami kahapon sa plaza."
6. **Only if steps 1–5 pass before 16:50:** try the Filipino fine-tune. Convert
   `sapinsapin/whisper-small-fsc` to ggml with whisper.cpp's conversion script, quantize it to
   q5, and repeat step 5. Skip this step if time is short.

## What to report (paste in the team chat and in the spike's GitHub issue)

| Item | Result |
|---|---|
| Toolchain ready? time spent | |
| Package used (name + version) | |
| Model file + size (MB) | |
| Load time (s) | |
| Time to transcribe a 4 s sentence (s) | |
| Transcripts for the 3 sentences (both tries) | |
| Works with Wi-Fi and data off? | yes / no |
| Biggest problem | |
| Your verdict | switch / do not switch |

## How we decide (at 19:00, with the Checkpoint 1 numbers)

We switch to Flutter **only if all** are true:

1. The spike app works offline on the Poco X6 Pro.
2. It is **clearly faster** than the web app's small tier on the same phone.
3. The team accepts that judges get an APK (or our phone) instead of a link, and that the laptop
   demo needs a second build.

Otherwise the web app stays. Either way, we record the result in `docs/validation.md`. If we
switch, a new ADR replaces ADR-0002.
