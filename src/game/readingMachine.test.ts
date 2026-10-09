import { describe, expect, it } from 'vitest'
import { initialReading, readingReducer as next, type ReadingState } from './readingMachine'

const run = (...events: Parameters<typeof next>[1][]): ReadingState => events.reduce(next, initialReading)

describe('reading state machine (docs/uml/state.md §1)', () => {
  it('goes ready → listening → thinking → revealing → reviewed', () => {
    let s = run({ type: 'mic-started' })
    expect(s.phase).toBe('listening')
    s = next(s, { type: 'stopped' })
    expect(s.phase).toBe('thinking')
    s = next(s, { type: 'scored', words: 3 })
    expect(s).toMatchObject({ phase: 'revealing', shown: 0, total: 3 })
    s = next(next(next(s, { type: 'reveal-tick' }), { type: 'reveal-tick' }), { type: 'reveal-tick' })
    expect(s).toMatchObject({ phase: 'reviewed', shown: 3 })
  })

  it('ignores a second stop (auto-stop and a tap in the same frame)', () => {
    const s = run({ type: 'mic-started' }, { type: 'stopped' })
    expect(next(s, { type: 'stopped' })).toBe(s)
  })

  it('returns to ready with a kind notice on silence, and marks nothing', () => {
    const s = run({ type: 'mic-started' }, { type: 'stopped' }, { type: 'silence' })
    expect(s).toMatchObject({ phase: 'ready', notice: 'reading.silence', total: 0 })
  })

  it('returns to ready with a kind notice when the model fails', () => {
    const s = run({ type: 'mic-started' }, { type: 'stopped' }, { type: 'failed' })
    expect(s).toMatchObject({ phase: 'ready', notice: 'reading.modelRetry' })
  })

  it('shows the denied or unavailable notice when the mic cannot start', () => {
    expect(run({ type: 'mic-failed', denied: true }).notice).toBe('mic.denied')
    expect(run({ type: 'mic-failed', denied: false }).notice).toBe('mic.unavailable')
  })

  it('allows a retry from reviewed and clears the notice', () => {
    const reviewed = run({ type: 'mic-started' }, { type: 'stopped' }, { type: 'scored', words: 1 }, { type: 'reveal-tick' })
    expect(reviewed.phase).toBe('reviewed')
    // The old marks stay until a new score replaces them, so a failed retry can fall back to them.
    const again = next({ ...reviewed, notice: 'reading.silence' }, { type: 'mic-started' })
    expect(again).toEqual({ phase: 'listening', shown: 1, total: 1, scored: true })
    expect(next(next(again, { type: 'stopped' }), { type: 'scored', words: 4 })).toMatchObject({ phase: 'revealing', shown: 0, total: 4 })
  })

  it('a failed retry on a scored sentence keeps the marks and the Next button', () => {
    const reviewed = run({ type: 'mic-started' }, { type: 'stopped' }, { type: 'scored', words: 2 }, { type: 'reveal-tick' }, { type: 'reveal-tick' })
    const retrying = next(next(reviewed, { type: 'mic-started' }), { type: 'stopped' })
    expect(next(retrying, { type: 'silence' })).toEqual({ phase: 'reviewed', shown: 2, total: 2, scored: true, notice: 'reading.silence' })
    expect(next(retrying, { type: 'failed' })).toMatchObject({ phase: 'reviewed', shown: 2, notice: 'reading.modelRetry' })
    expect(next(reviewed, { type: 'mic-failed', denied: true })).toMatchObject({ phase: 'reviewed', shown: 2, notice: 'mic.denied' })
  })

  it('the model can be not ready; the child may then skip the sentence without a mark', () => {
    const s = run({ type: 'model-unavailable' })
    expect(s).toMatchObject({ phase: 'ready', notice: 'reading.modelUnavailable', canSkip: true })
    expect(next(s, { type: 'next' })).toEqual(initialReading)
  })

  it('a stray reveal tick or score outside its phase changes nothing', () => {
    expect(next(initialReading, { type: 'reveal-tick' })).toBe(initialReading)
    expect(next(initialReading, { type: 'scored', words: 2 })).toBe(initialReading)
  })

  it('moves to the next sentence only from reviewed', () => {
    expect(next(initialReading, { type: 'next' })).toBe(initialReading)
    const reviewed = run({ type: 'mic-started' }, { type: 'stopped' }, { type: 'scored', words: 0 })
    expect(reviewed.phase).toBe('reviewed') // an empty sentence reveals at once
    expect(next(reviewed, { type: 'next' })).toEqual(initialReading)
  })
})
