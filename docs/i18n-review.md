# Interface copy review — issue #22

The Filipino and English dictionaries keep the existing flat string-key interface. They now include four distinct cheering lines and four encouraging lines per language, all six mascot moods through existing reaction/status keys, and keys used by the designer's open mic-check, settings, and progress branches. The offline keys from the lead's open PR are included too.

## Integration decisions

- Keep `reading.silence` as **Hindi kita narinig. Subukan natin ulit!**. Issue #22 explicitly requires this sentence. The designer's `copy.test.ts` on the open UI branches currently pins **Hindi kita narinig. Ulitin natin!**; reconcile that expectation with the issue when integrating. Do not silently replace the required wording.
- `miccheck.say` is now only the label **Sabihin:** / **Say:**, with `miccheck.phrase` holding **Kumusta, Ningning!**. This matches the designer's incoming MicCheckView. The scaffold MicCheck is updated to display both keys so it does not lose the phrase.
- `reading.reviewed` uses neutral guidance about looking at the words. It does not assume every reading is correct or that a circled-word UI already exists.
- Existing `mascot.cheer` / `mascot.encourage` keys remain strings; `.2`, `.3`, `.4` provide additional lines. This does not change the translation API or introduce random reaction selection.
- Only copy/accessibility wiring changes in scaffold screens are included. Keep the designer's layout and functional changes when merging those screens; transfer these translation keys into the final components.

## Review state

The user reviewed the proposed Filipino copy and replied **All good keep it open for suggestion**. Issue #22 remains open for suggestions as requested. No independent native-speaker qualification or final integrated-device QA is claimed.

Automated checks cover dictionary parity, nonempty values, matching interpolation fields, four distinct reaction variants, and server rendering of all eight scaffold screens in each saved language. These checks do not replace browser interaction or the final language-toggle audit on the integrated UI.

## Final integration checklist

- [ ] Review copy with a confirmed native Filipino speaker and record corrections, if any.
- [ ] Resolve the designer's silence-copy assertion in favor of the issue's required sentence.
- [ ] Switch languages on the final Home, story map, Reading, Result, mic check, settings, progress, and Word Pop screens.
- [ ] Check recording, silence, denied-mic, unavailable-mic, download, empty-progress, and playback states in both languages.
- [ ] Ensure no raw message keys or untranslated text appears, including accessible control names.
- [ ] Confirm that actual sentence text remains Filipino/Taglish while story titles follow the chosen interface language.

Do not close #22 until these final acceptance checks are recorded and the user wants the issue closed.
