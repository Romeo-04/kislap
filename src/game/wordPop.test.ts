import { describe, expect, it } from 'vitest'
import { initialWordPop, isDone, matchesWord, tapBubble, wordPopReducer, type WordPopEvent, type WordPopState } from './wordPop'

describe('matchesWord', () => {
  it('accepts the word with Whisper punctuation and case', () => {
    expect(matchesWord('bata', ' Bata.')).toBe(true)
  })

  it('accepts a near miss at similarity 0.6 or more', () => {
    expect(matchesWord('paaralan', 'paralan')).toBe(true) // 7/8
    expect(matchesWord('pusa', 'busa')).toBe(true) // 3/4
  })

  it('rejects a different word', () => {
    expect(matchesWord('pusa', 'aso')).toBe(false)
  })

  it('finds the word inside a longer transcription', () => {
    expect(matchesWord('hardin', 'sa hardin po')).toBe(true)
  })

  it('rejects an empty transcription', () => {
    expect(matchesWord('bata', '  ')).toBe(false)
  })
})

const say = (s: WordPopState, text: string): WordPopState =>
  ([{ type: 'mic-started' }, { type: 'stopped' }, { type: 'heard', text }] as WordPopEvent[]).reduce(wordPopReducer, s)

describe('word pop state machine', () => {
  it('pops the bubble when the child says the word, and moves to the next one', () => {
    const s = say(initialWordPop(['bata', 'pusa']), 'bata')
    expect(s.bubbles[0]).toMatchObject({ word: 'bata', popped: 'said' })
    expect(s).toMatchObject({ phase: 'ready', current: 1, last: 'said' })
  })

  it('counts a miss as a try and keeps the bubble', () => {
    const s = say(initialWordPop(['bata', 'pusa']), 'aso')
    expect(s.bubbles[0].tries).toBe(1)
    expect(s.bubbles[0].popped).toBeUndefined()
    expect(s).toMatchObject({ phase: 'ready', current: 0, last: 'missed' })
  })

  it('pops the bubble anyway on the second miss', () => {
    const s = say(say(initialWordPop(['bata', 'pusa']), 'aso'), 'aso')
    expect(s.bubbles[0]).toMatchObject({ tries: 2, popped: 'helped' })
    expect(s).toMatchObject({ current: 1, last: 'helped' })
  })

  it('skips popped bubbles and wraps around when it moves on', () => {
    let s = wordPopReducer(initialWordPop(['bata', 'pusa', 'aso']), { type: 'pick', index: 2 })
    s = say(s, 'aso')
    expect(s.current).toBe(0)
    s = say(s, 'bata')
    expect(s.current).toBe(1)
  })

  it('is done when every bubble has popped', () => {
    const s = say(say(initialWordPop(['bata', 'pusa']), 'bata'), 'pusa')
    expect(isDone(s)).toBe(true)
    expect(isDone(initialWordPop(['bata']))).toBe(false)
  })

  it('cannot pick a popped bubble or pick while listening', () => {
    const s = say(initialWordPop(['bata', 'pusa']), 'bata')
    expect(wordPopReducer(s, { type: 'pick', index: 0 })).toBe(s)
    const listening = wordPopReducer(s, { type: 'mic-started' })
    expect(wordPopReducer(listening, { type: 'pick', index: 1 })).toBe(listening)
  })
})

describe('word pop never costs the child', () => {
  const thinking = ([{ type: 'mic-started' }, { type: 'stopped' }] as WordPopEvent[]).reduce(wordPopReducer, initialWordPop(['bata']))

  it('does not count silence as a try', () => {
    const s = wordPopReducer(thinking, { type: 'silence' })
    expect(s).toMatchObject({ phase: 'ready', notice: 'reading.silence' })
    expect(s.bubbles[0].tries).toBe(0)
  })

  it('does not count a model error as a try', () => {
    const s = wordPopReducer(thinking, { type: 'failed' })
    expect(s).toMatchObject({ phase: 'ready', notice: 'reading.modelRetry' })
    expect(s.bubbles[0].tries).toBe(0)
  })

  it('shows the mic notice when the mic cannot start', () => {
    expect(wordPopReducer(initialWordPop(['bata']), { type: 'mic-failed', denied: true })).toMatchObject({ phase: 'ready', notice: 'mic.denied' })
    expect(wordPopReducer(initialWordPop(['bata']), { type: 'mic-failed', denied: false }).notice).toBe('mic.unavailable')
  })

  it('lets the child pop a bubble with Skip when the model cannot run', () => {
    let s = wordPopReducer(initialWordPop(['bata', 'pusa']), { type: 'model-unavailable' })
    expect(s).toMatchObject({ canSkip: true, notice: 'reading.modelUnavailable' })
    s = wordPopReducer(s, { type: 'skip' })
    expect(s.bubbles[0].popped).toBe('helped')
    expect(s).toMatchObject({ current: 1, canSkip: true })
  })

  it('still offers Skip when the model fails while the child is recording or Ningning is thinking', () => {
    const listening = wordPopReducer(initialWordPop(['bata']), { type: 'mic-started' })
    expect(wordPopReducer(listening, { type: 'model-unavailable' })).toMatchObject({ phase: 'listening', canSkip: true })
    let s = wordPopReducer(thinking, { type: 'model-unavailable' })
    expect(s).toMatchObject({ phase: 'thinking', canSkip: true })
    s = wordPopReducer(s, { type: 'failed' })
    expect(s).toMatchObject({ phase: 'ready', canSkip: true })
    expect(wordPopReducer(s, { type: 'skip' }).bubbles[0].popped).toBe('helped')
  })

  it('ignores Skip while the model can run', () => {
    const s = initialWordPop(['bata'])
    expect(wordPopReducer(s, { type: 'skip' })).toBe(s)
  })

  it('clears the notice when the mic starts again', () => {
    const s = wordPopReducer(wordPopReducer(thinking, { type: 'silence' }), { type: 'mic-started' })
    expect(s.notice).toBeUndefined()
  })
})

describe('word pop review fixes', () => {
  const thinking = (words = ['bata']) => ([{ type: 'mic-started' }, { type: 'stopped' }] as WordPopEvent[]).reduce(wordPopReducer, initialWordPop(words))

  it('pops at similarity exactly 0.6 and not below it', () => {
    expect(matchesWord('tubig', 'tabog')).toBe(true) // 3/5
    expect(matchesWord('tubig', 'tabos')).toBe(false) // 2/5
  })

  it('matches a word Whisper split in two', () => {
    expect(matchesWord('paaralan', 'paa ralan')).toBe(true)
  })

  it('does not count a blank transcription as a try', () => {
    const s = wordPopReducer(thinking(), { type: 'heard', text: '  ' })
    expect(s).toMatchObject({ phase: 'ready', notice: 'reading.modelRetry' })
    expect(s.bubbles[0].tries).toBe(0)
  })

  it('offers Skip after the model fails twice in a row', () => {
    let s = wordPopReducer(thinking(), { type: 'failed' })
    expect(s.canSkip).toBeFalsy()
    s = ([{ type: 'mic-started' }, { type: 'stopped' }, { type: 'failed' }] as WordPopEvent[]).reduce(wordPopReducer, s)
    expect(s.canSkip).toBe(true)
  })

  it('offers Skip when the mic cannot start', () => {
    expect(wordPopReducer(initialWordPop(['bata']), { type: 'mic-failed', denied: true }).canSkip).toBe(true)
  })

  it('marks the model missing so the screen does not try to download it', () => {
    expect(wordPopReducer(initialWordPop(['bata']), { type: 'model-unavailable' }).noModel).toBe(true)
    expect(wordPopReducer(thinking(), { type: 'model-unavailable' }).noModel).toBe(true)
  })

  it('says the model is missing, not "try again", when a try ends after it went missing', () => {
    const s = ([{ type: 'model-unavailable' }, { type: 'failed' }] as WordPopEvent[]).reduce(wordPopReducer, thinking())
    expect(s).toMatchObject({ phase: 'ready', notice: 'reading.modelUnavailable', canSkip: true })
  })

  it('does nothing on an empty round', () => {
    const empty = initialWordPop([])
    for (const e of [{ type: 'mic-started' }, { type: 'skip' }, { type: 'pick', index: 0 }] as WordPopEvent[]) {
      expect(wordPopReducer({ ...empty, canSkip: true }, e)).toEqual({ ...empty, canSkip: true })
    }
  })

  it('floats each word once even if the save repeats one', () => {
    expect(initialWordPop(['bata', 'pusa', 'bata']).bubbles.map((b) => b.word)).toEqual(['bata', 'pusa'])
  })

  it('keeps the model notice after a Skip', () => {
    const s = wordPopReducer(wordPopReducer(initialWordPop(['bata', 'pusa']), { type: 'model-unavailable' }), { type: 'skip' })
    expect(s.notice).toBe('reading.modelUnavailable')
  })

  it('ignores a second stop and a heard clip outside thinking', () => {
    const s = thinking()
    expect(wordPopReducer(s, { type: 'stopped' })).toBe(s)
    const ready = initialWordPop(['bata'])
    expect(wordPopReducer(ready, { type: 'heard', text: 'bata' })).toBe(ready)
  })
})

describe('tapBubble', () => {
  it('opens and closes the syllables of the current bubble', () => {
    const s = initialWordPop(['bata', 'pusa'])
    expect(tapBubble(s, undefined, 0)).toEqual({ open: 0 })
    expect(tapBubble(s, 0, 0)).toEqual({ open: undefined })
  })

  it('moves to another bubble with its syllables open', () => {
    expect(tapBubble(initialWordPop(['bata', 'pusa']), undefined, 1)).toEqual({ open: 1, pick: 1 })
  })

  it('does not move while listening', () => {
    const listening = wordPopReducer(initialWordPop(['bata', 'pusa']), { type: 'mic-started' })
    expect(tapBubble(listening, undefined, 1)).toEqual({ open: undefined })
  })
})
