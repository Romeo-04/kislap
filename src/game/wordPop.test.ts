import { describe, expect, it } from 'vitest'
import { initialWordPop, isDone, matchesWord, wordPopReducer, type WordPopEvent, type WordPopState } from './wordPop'

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
