# Release QA

Owner: Emyol. Tracks [#24](https://github.com/Romeo-04/kislap/issues/24) and the final [#38](https://github.com/Romeo-04/kislap/issues/38) gate. This is a test plan with partial evidence. It is not release approval.

## Automated checks

Run these on the release SHA before the device runs:

```
npx tsc -b
npx vitest run
npm run build
```

Record the test count. On 2026-10-10 (main merged into this branch), all three pass: 28 test files, 363 tests.

## Evidence recorded

| Check | Source | Result |
| --- | --- | --- |
| Saved-progress recovery | [#68](https://github.com/Romeo-04/kislap/issues/68), fixed by #84 | **Fixed.** `loadProgress` in `src/game/progress.ts` checks each saved field on its own, keeps valid stars and Stickers, and logs `[progress] recovered a damaged save` in the console. Regression tests: the `saved progress recovery (#68)` block in `src/game/progress.test.ts`. |
| Progress tests | `src/game/progress.test.ts` on main | 31 tests: persistence, best Stars, Stickers, Streak, Practice words, English default, #68 recovery. |
| Integrated reading loop | PROGRESS.md log, 2026-10-10 05:30 | The lead finished a production Reading session offline with the real Speech model (8 of 8 Sentences, Sticker earned). Device, tier and Network log are not recorded. This does not replace a row in the device matrix. |

History: the #68 probe ran on PR #52 (`06bc432`). Then, `{"version":1,"lang":"xx"}` was accepted, and `null` stars, stickers or streak, or a string `practiceWords`, caused a TypeError. On main now, all four values recover. An unknown or unchosen language falls back to English.

## Facts a tester needs

- **Routes.** Home `#/`, Story map `#/map`, Reading `#/reading/story-1` (also `story-2`, `story-3`), Result `#/result/<id>`, Sticker jar `#/progress`, Word Pop `#/wordpop`, Mic check `#/miccheck`, Settings `#/settings`.
- **Language.** The app opens in English. Story Sentences stay in Filipino. Switch with the toggle on Home or the Language pills in Settings. A choice made in the UI survives a reload.
- **Offline ready.** Home shows a paper slip: "Works offline" / "Handa kahit offline" when the app shell and the Speech model are cached. Otherwise it shows "Download for offline" / "I-download para magamit offline", or "Connect to the internet first to get Ningning ready." when offline with no model.
- **Speech model tier.** Both devices use the small tier by default: `onnx-community/whisper-base`, q8, WebAssembly, about 77 MB. `?tier=large` forces the large tier, which does not run in Transformers.js 4.3.1 (see `docs/submission.md` D8). Test the default. The tier shows on the dev page `#/asrtest`.
- **Reading buttons (English / Filipino).** "Tap the mic and read" / "Pindutin ang mikropono at basahin", "I've finished reading" / "Tapos na akong magbasa", "Next" / "Susunod", "Try again", "Skip".
- **Privacy meter.** It is on the Reading screen only. It reads "0 requests left this device" / "0 na kahilingan ang lumabas sa device na ito". Tap it to see the list of counted URLs. It starts from zero each time Reading opens.
- **Privacy meter limits** (`src/privacy/meter.ts`). It counts requests, not bytes. It counts every cross-origin request, and every same-origin request that was not served from the cache. It sees the main thread only. The model worker's requests are **not** counted: `meter.report()` has no caller. So a meter at 0 is supporting evidence only. The DevTools Network log is the proof.

## Device evidence matrix

For each run, record the deployed URL, the release SHA, the tester, the local time, the OS and Chrome version, the tier, and where the evidence is saved. Run the affected checks again after any change to the release.

| Check | Laptop / Chrome | Poco X6 Pro / Chrome |
| --- | --- | --- |
| URL, SHA, tester, time, versions, tier | Not recorded | Not recorded |
| First load: Home shows "Works offline" | Not run | Not run |
| Spec §12 offline check: Wi-Fi and data off, reload, finish one full Story | Not run | Not run |
| Network tab: no request during the Reading session (worker included) | Not run | Not run |
| Privacy meter reads 0 and matches the Network tab | Not run | Not run |
| "Download for offline" restores a deleted cache | Not run | Not run |
| Language toggle changes all interface text and survives reload | Not run | Not run |
| Mic denied, no mic, silence, Try again, Skip | Not run | Not run |
| Progress survives reload; best Stars kept; Sticker on every finish | Not run | Not run |
| Damaged save recovers with no crash (#68) | Not run | Not run |

Mark each cell Pass or Fail with a link to the evidence. Never mark a check Pass from inference.

## Run procedure

1. **Setup.** Use a new Chrome profile on the laptop. On the phone, clear the site data for the release URL first. Open the release URL online. Record the metadata row. Wait until Home shows "Works offline". If it shows "Download for offline", tap it and wait.
2. **Phone DevTools.** Connect the Poco X6 Pro by USB with USB debugging on. On the laptop, open `chrome://inspect` and inspect the phone tab. You need this to record the phone's Network log.
3. **Network tab.** Open DevTools > Network. Select "All". Keep recording on. Do not filter. Clear the log after setup.
4. **Offline check (spec §12).** Turn off Wi-Fi and mobile data (on the laptop, also unplug Ethernet). Close and open the tab, or do a normal reload. Do not do a hard reload. Home must still show "Works offline".
5. **Reading session.** Open the Story map and pick a Story. Read all 8 Sentences aloud: tap the mic, read, tap "I've finished reading" (or wait for auto-stop), then tap "Next". Finish on the Result screen and check the Stars and the Sticker.
6. **Network and Privacy meter.** Before you leave Reading, record:
   - the Network log, including rows from the worker (check the Initiator column). Allowed: same-origin GET rows served "(ServiceWorker)" or "(disk cache)", such as the worker script and runtime files on the first Attempt. Fail: any cross-origin request, any request with a body (POST, upload), and any same-origin row that went to the network. Find the initiator of each failing row and file an issue.
   - the Privacy meter text. Tap it and record the URL list. If the meter and the Network log disagree, the Network log wins. File the difference.
7. **Meter blind spot.** In a new profile online, open Reading before the model is cached. The worker checks the cache when Reading opens. Compare the Network log with the meter. Record the result: it shows whether worker traffic is missed.
8. **Reload offline.** Still offline, reload. Check that the Stars and the Sticker are still on the map and in the Sticker jar (`#/progress`).
9. **Language.** Go online or stay offline. Switch English to Filipino on Home, then back in Settings. Visit Home, Story map, Reading, Result, Sticker jar, Word Pop, Mic check and Settings. Check buttons, hints, errors and screen-reader labels. Story Sentences stay Filipino. Reload and check the choice is kept.
10. **Mic and model states.** Block the microphone in site settings and tap the mic: the kind "Ningning needs the microphone" message must show. Allow it again and tap "Try again". Read nothing and tap stop: "I couldn't hear you. Let's try again!". Clear site data and go offline, then open Reading: "Ningning isn't ready to listen yet…" with "Skip". No raw error text may show to the child.
11. **Progress rules.** Finish a Story twice with a lower second result: the best Stars stay. The first finish earns a Sticker even at 0 Stars. A 3-Star finish earns a bonus Sticker. Streak rules (same day counts once, a missed day never resets) are covered by `src/game/progress.test.ts`. Do not change the system clock.
12. **Damaged save (#68).** In a throwaway profile, in the DevTools console, run `localStorage.setItem('kislap.progress.v1', '{"version":1,"stars":null,"streak":null,"practiceWords":"bata"}')` and reload. The app must open with no crash, and the console shows `[progress] recovered a damaged save`.
13. **File failures** as `qa` issues with the SHA, the device, the exact steps, the expected and actual result, and synthetic data. Link each issue here.
14. **Cache restore.** Online, clear the site's storage (DevTools > Application > Clear site data, keep the profile). Reload. Tap "Download for offline". Repeat step 4.
15. **Download failure.** In a new profile, tap "Download for offline", then turn off Wi-Fi before it ends. Expect "The download did not finish. Try again." and the button again. Go online and tap it: the download must finish.

## Submission claims review (#37 and #44)

Reviewed `docs/submission.md` on main. Its why-local text covers sensitive voice data, offline use and checkable privacy. Final approval waits for the device and network evidence above and a comparison with the final README, videos and form.

- D6, D13 and `README.md` say the Privacy meter and the network tab both show zero requests during reading. Keep this as a draft claim until both device runs pass. The meter cannot see the worker, so say "the browser network tab shows" as the proof, and treat the meter as a visual aid.
- D7 says nothing else downloads after setup. Confirm with the offline reload on both devices before you use it.
- D8: the code ships `onnx-community/whisper-base`, q8, about 77 MB, on every device (`src/asr/tier.ts`). Use this to settle the [confirm] marks.
- D11 needs a source and a licence for each asset and library. `package.json` alone is not a full licence record.
- D12 needs each teammate's own tool list. Do not fill in another teammate's tools.

Suggested why-local text for the lead, after the checks pass:

> A child's voice is sensitive data. Kislap runs speech recognition and reading feedback on the device, with no account and no audio upload. After the app and the speech model download once, children can practise offline where signal is weak or data is costly. Anyone can open the browser network tab during reading and see that nothing leaves the device.

This is a review suggestion. It does not change the lead's draft, and it does not claim the device checks passed.

## Final release gate (#38)

- [ ] Record the final deployed URL and release SHA. Repeat affected checks after changes.
- [ ] Run the automated checks above on that SHA.
- [ ] Complete the laptop and Poco X6 Pro rows above on that release.
- [ ] Open the site and the public repository without signing in. Check the README setup steps and links.
- [ ] Check public playback of the final X and LinkedIn videos and their links in the submission.
- [ ] Compare the README, video and form claims with the evidence and the shipped model.
- [ ] Confirm D1 to D13 are closed and the #37 review is complete. List any open item and its owner.
- [ ] Record the final verdict by 08:00 Oct 10, before the lead's 08:30 submission target.

Keep #24 and #38 open until their remaining acceptance criteria have evidence.
