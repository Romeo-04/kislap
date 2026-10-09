# Release QA

Owner: Emyol. Tracks [#24](https://github.com/Romeo-04/kislap/issues/24) and the final [#38](https://github.com/Romeo-04/kislap/issues/38) gate. This is a test plan with partial evidence, not release approval.

## Evidence recorded on 2026-10-09

| Check | Source | Result |
| --- | --- | --- |
| Saved-progress recovery probe | PR #52, `06bc4323796af7e0ac41dd8002cccfca9fa3e4e8` | Invalid JSON recovers; valid JSON with invalid fields is unsafe. Filed [#68](https://github.com/Romeo-04/kislap/issues/68). |
| Progress test coverage inspection | Same PR, `src/game/progress.test.ts` | 16 tests already cover persistence, best stars, stickers, streak continuity and practice words. Inspected, not executed as a suite in this QA branch. |
| Copy checks | PR #67, `b3d5c28` | Eight tests pass, including dictionary parity and server rendering; build passes. These do not prove interactive language switching. |
| Integrated release candidate | Main snapshot `6e87e5f6b5e3927c1d86acca0ffe699cba361c17` | Scaffold only; dependent feature PRs remain unmerged at this inspection. |

The progress probe transpiled the unchanged PR #52 module with the installed TypeScript compiler, then invoked it in a Node VM with synthetic localStorage values. No real saved data was changed. For key `kislap.progress.v1`:

| Stored value | Operation after loading | Observed result |
| --- | --- | --- |
| `{not json` | Read `lang` | `fil`, safe default |
| `{"version":1,"lang":"xx"}` | Read `lang` | Unsupported `xx` accepted |
| `{"version":1,"stars":null,"stickers":null,"streak":null}` | Read `streak.days` | TypeError |
| `{"version":1,"practiceWords":"bata"}` | Call `addPracticeWords(progress, ['pusa'])` | TypeError |

Reuse the progress tests from PR #52 after integration; do not add a second copy. Fix #68 with regression tests for invalid field shapes, then rerun the full suite, typecheck and production build on the release candidate. The current probe documents a failure, not a passing regression test.

## Device evidence matrix

Record the deployed URL, exact release SHA, tester, local time, OS/Chrome version, selected model/tier/dtype and evidence location for each run. Rerun affected checks after changes to the release candidate.

| Check | Laptop / Chrome | Poco X6 Pro / Chrome |
| --- | --- | --- |
| URL, SHA, tester, time, versions and model | Not recorded | Not recorded |
| First setup and model download complete | Not run | Not run |
| Cold offline reload and complete story | Not run | Not run |
| No requests during reading; meter zero | Not run | Not run |
| Filipino / English visible copy and accessible labels | Not run | Not run |
| Mic denied, silence, retry and model failure | Not run | Not run |
| Saved progress survives reload; best stars kept | Not run | Not run |
| Streak continues after missed days | Not run | Not run |

No browser control surface or physical phone was available in this session. All device rows remain pending until a tester performs them.

## Run procedure

1. Use a dedicated test profile. Open the release URL online, record the metadata above, finish model setup and confirm the app reports offline readiness. Keep first-download traffic separate from reading traffic.
2. Open DevTools Network with all request types visible and recording enabled. Clear the log after setup. Start the reading session and finish all eight sentences of a story. Record the Network log and privacy meter before leaving Reading. Any request during this window fails the zero-request criterion, even if it fails or uses the cache; investigate its initiator. Never filter the log to hide requests.
3. Turn off Wi-Fi and cellular data (also disconnect other active network connections). Close and reopen the app or perform a normal cold reload. Do not use a cache-bypassing hard reload. Finish a complete story, inspect the result and saved reward, then reload again. Repeat on both devices. Record the selected tier; one device's result does not prove the other tier works.
4. Switch Filipino to English and back through the actual UI. Visit setup/model loading, Home, story selection, mic check, Reading, Result, Progress and recovery screens. Check buttons, menus, statuses, errors, hints and accessible labels. Story reading text remains Filipino; bilingual titles and interface copy must follow the chosen language. Verify the selection persists after reload.
5. Exercise denied mic permission, unsupported/unavailable microphone, silence, retry and model download failure. Re-enable permission and verify recovery. Use a fresh test profile for first-download failure so existing caches do not hide it. Check kind wording and absence of raw technical error messages in child-facing screens.
6. Finish a story twice with a lower second score; best stars must remain. Check first-finish sticker and bonus rules. Verify same-day streak does not increase twice and missed days never reset it, using automated date inputs rather than changing the tester's system clock. After #68 is fixed, test corrupted saved fields in a disposable profile and confirm recovery without a startup crash.
7. File failures as `qa` issues with SHA, device, exact steps, expected/actual behavior and synthetic data where possible. Link each issue in this document. Record pass/fail per row; do not replace unperformed checks with inferred passes.

The privacy meter is supporting evidence. PR #54 uses ResourceTiming (received bytes, with cross-origin visibility limits), and worker requests need explicit reporting. A zero meter alone cannot prove that no audio/text was transmitted. Inspect the complete Network log and relevant worker traffic as well.

## Submission claims review (#37 and #44)

Reviewed the draft `docs/submission.md` on PR #57. Its why-local paragraph covers sensitive voice data, offline use and verifiability. Final approval remains pending integrated device/network evidence and comparison with the final README, videos and form.

- D6 and D13 assert zero requests during reading. Keep these as unverified draft claims until both device runs above pass; the meter alone is insufficient evidence.
- D7 says nothing else downloads after setup. Confirm all runtime/model assets are cached with a cold offline reload on both tiers before using that claim.
- D8 still needs the final model identifiers, dtypes and any adapter details. Match the actual selected models and their documented terms.
- D11 needs traceable asset and library credits; package.json alone is not a complete license record.
- D12 needs each teammate's actual tool use. Do not fill in another teammate's disclosure by assumption.

Suggested why-local wording for the lead to use after verification:

> A child's voice is sensitive data. Kislap runs speech recognition and reading feedback on the device, without an account or audio upload. After the app and selected model finish downloading, children can practise offline where signal is weak or data is costly. The privacy meter reports observed requests, and our device QA checks the browser Network log during reading.

This is a review suggestion, not a change to the lead's draft or a claim that the device checks have passed.

## Final release gate (#38)

- [ ] Record the final deployed URL and release SHA; repeat affected checks after changes.
- [ ] Complete the laptop and Poco offline/network runs above on that release.
- [ ] Open the site and public repository without signing in; verify README setup instructions and links.
- [ ] Check public playback of the final X and LinkedIn videos and their links in the submission.
- [ ] Compare the README, video and form claims with the evidence and final model configuration.
- [ ] Confirm D1-D13 are closed and #37 review is complete; list any open item and owner.
- [ ] Record the final verdict by 08:00 Oct 10, before the lead's 08:30 submission target.

Keep #24 and #38 open until their remaining acceptance criteria have evidence.
