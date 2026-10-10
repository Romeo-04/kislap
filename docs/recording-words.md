# Recording the word clips (Listen button)

The **Listen / Pakinggan** button in word help plays these recordings. They ship with the app, work
offline on every device, and replace the phone's own voice. All 85 distinct words in the three
stories are listed below, in reading order.

## How to record

1. Use a quiet room and any phone voice recorder. Hold the phone about 20 cm from your mouth.
2. Say each word **once, slowly and clearly**, the way a teacher models it for a Grade 1 child. Say it
   as a whole word, not as syllables (the syllables already show on screen).
3. Save one file per word. **Name the file after the word**, as in the table (`gabi.m4a`, `dahan-dahan.m4a`).
   Any format works: `.m4a`, `.mp3`, `.wav`, `.ogg`, `.webm`, `.aac`, `.3gp`.
4. Put all the files in one folder and copy it to the laptop.

## How to add them to Kislap

From the repo root on `main`:

```bash
bash scripts/add-word-clips.sh <folder-with-recordings>
```

The script trims the silence, evens out the loudness, converts each file to a small MP3 (about
6 KB), copies it to `public/audio/words/`, and lists it in `src/content/wordClips.json`. Commit both,
open a PR, then publish with `bash scripts/publish-pages.sh`. A word you have not recorded yet keeps
using the device voice, so you can add clips in batches.

**Credit:** add the reader's name to `docs/assets.md` ("Word recordings: <name>, own work").

## The words

### Ang Ilaw ni Ningning (easy): 23 new words

| # | Word | File name |
|---|---|---|
| 1 | gabi | `gabi.m4a` |
| 2 | na | `na.m4a` |
| 3 | sa | `sa.m4a` |
| 4 | baryo | `baryo.m4a` |
| 5 | ni | `ni.m4a` |
| 6 | lila | `lila.m4a` |
| 7 | may | `may.m4a` |
| 8 | pusa | `pusa.m4a` |
| 9 | puno | `puno.m4a` |
| 10 | takot | `takot.m4a` |
| 11 | ang | `ang.m4a` |
| 12 | dilim | `dilim.m4a` |
| 13 | munting | `munting.m4a` |
| 14 | ilaw | `ilaw.m4a` |
| 15 | damo | `damo.m4a` |
| 16 | si | `si.m4a` |
| 17 | ningning | `ningning.m4a` |
| 18 | pala | `pala.m4a` |
| 19 | karga | `karga.m4a` |
| 20 | gabay | `gabay.m4a` |
| 21 | nila | `nila.m4a` |
| 22 | bahay | `bahay.m4a` |
| 23 | tulog | `tulog.m4a` |

### Ang Munting Hardin (medium): 25 new words

| # | Word | File name |
|---|---|---|
| 1 | maliit | `maliit.m4a` |
| 2 | hardin | `hardin.m4a` |
| 3 | tuwing | `tuwing.m4a` |
| 4 | dumadalaw | `dumadalaw.m4a` |
| 5 | doon | `doon.m4a` |
| 6 | napansin | `napansin.m4a` |
| 7 | tuyong | `tuyong.m4a` |
| 8 | lupa | `lupa.m4a` |
| 9 | lanta | `lanta.m4a` |
| 10 | puting | `puting.m4a` |
| 11 | sampaguita | `sampaguita.m4a` |
| 12 | kumuha | `kumuha.m4a` |
| 13 | siya | `siya.m4a` |
| 14 | ng | `ng.m4a` |
| 15 | tubig | `tubig.m4a` |
| 16 | balon | `balon.m4a` |
| 17 | dumating | `dumating.m4a` |
| 18 | ben | `ben.m4a` |
| 19 | dalang | `dalang.m4a` |
| 20 | timba | `timba.m4a` |
| 21 | dahan-dahan | `dahan-dahan.m4a` |
| 22 | nilang | `nilang.m4a` |
| 23 | diniligan | `diniligan.m4a` |
| 24 | umaga | `umaga.m4a` |
| 25 | tuwid | `tuwid.m4a` |

### Kuwentuhan sa Ilalim ng Buwan (hard): 37 new words

| # | Word | File name |
|---|---|---|
| 1 | ilalim | `ilalim.m4a` |
| 2 | buwan | `buwan.m4a` |
| 3 | story | `story.m4a` |
| 4 | time | `time.m4a` |
| 5 | barangay | `barangay.m4a` |
| 6 | dala | `dala.m4a` |
| 7 | favorite | `favorite.m4a` |
| 8 | niyang | `niyang.m4a` |
| 9 | kuwento | `kuwento.m4a` |
| 10 | tungkol | `tungkol.m4a` |
| 11 | inayos | `inayos.m4a` |
| 12 | reading | `reading.m4a` |
| 13 | corner | `corner.m4a` |
| 14 | kasama | `kasama.m4a` |
| 15 | kumikislap | `kumikislap.m4a` |
| 16 | mga | `mga.m4a` |
| 17 | alitaptap | `alitaptap.m4a` |
| 18 | nang | `nang.m4a` |
| 19 | magsimulang | `magsimulang.m4a` |
| 20 | magbasa | `magbasa.m4a` |
| 21 | huminto | `huminto.m4a` |
| 22 | sandali | `sandali.m4a` |
| 23 | kaya | `kaya.m4a` |
| 24 | mo | `mo.m4a` |
| 25 | iyan | `iyan.m4a` |
| 26 | take | `take.m4a` |
| 27 | your | `your.m4a` |
| 28 | sabi | `sabi.m4a` |
| 29 | huminga | `huminga.m4a` |
| 30 | malalim | `malalim.m4a` |
| 31 | at | `at.m4a` |
| 32 | binasa | `binasa.m4a` |
| 33 | nagpalakpakan | `nagpalakpakan.m4a` |
| 34 | bata | `bata.m4a` |
| 35 | habang | `habang.m4a` |
| 36 | lalong | `lalong.m4a` |
| 37 | nagningning | `nagningning.m4a` |
