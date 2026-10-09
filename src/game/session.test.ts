import { describe, expect, it } from 'vitest'
import { createSession, finishSession, resultFor } from './session'
import type { WordResult, WordStatus } from '../scoring/score'

const words = (...statuses: WordStatus[]): WordResult[] =>
  statuses.map((status, i) => ({ word: `w${i}`, status, similarity: status === 'correct' ? 1 : status === 'unclear' ? 0.7 : 0 }))

const attempt = (sentenceIndex: number, ws: WordResult[]) => ({
  sentenceIndex,
  heard: '',
  words: ws,
  accuracy: ws.reduce((s, w) => s + (w.status === 'correct' ? 1 : w.status === 'unclear' ? 0.5 : 0), 0) / ws.length,
})

describe('createSession', () => {
  it('weights accuracy by words across sentences, not by sentence average', () => {
    const s = createSession('story-1', 2)
    s.addAttempt(attempt(0, words('correct', 'correct', 'correct', 'correct'))) // 4/4
    s.addAttempt(attempt(1, words('missed', 'missed'))) // 0/2
    expect(s.accuracy()).toBeCloseTo(4 / 6) // not (1 + 0) / 2
  })

  it('counts unclear as half', () => {
    const s = createSession('story-1', 1)
    s.addAttempt(attempt(0, words('unclear', 'unclear')))
    expect(s.accuracy()).toBe(0.5)
  })

  it('keeps the best attempt per sentence, so a retry never lowers the score', () => {
    const s = createSession('story-1', 1)
    s.addAttempt(attempt(0, words('correct', 'correct')))
    s.addAttempt(attempt(0, words('missed', 'missed')))
    expect(s.accuracy()).toBe(1)
    s.addAttempt(attempt(0, words('correct', 'unclear')))
    expect(s.accuracy()).toBe(1)
  })

  it('takes practice words from the best attempt only', () => {
    const s = createSession('story-1', 1)
    s.addAttempt(attempt(0, [{ word: 'Pusa.', status: 'missed', similarity: 0 }, { word: 'ito', status: 'correct', similarity: 1 }]))
    s.addAttempt(attempt(0, [{ word: 'Pusa.', status: 'correct', similarity: 1 }, { word: 'ito', status: 'correct', similarity: 1 }]))
    expect(s.practiceWords()).toEqual([])
  })

  it('is complete only when every sentence has an attempt', () => {
    const s = createSession('story-1', 2)
    s.addAttempt(attempt(0, words('correct')))
    expect(s.isComplete()).toBe(false)
    s.addAttempt(attempt(1, words('missed')))
    expect(s.isComplete()).toBe(true)
  })

  it('has accuracy 0 with no attempts', () => {
    expect(createSession('story-1', 3).accuracy()).toBe(0)
  })
})

describe('finishSession / resultFor', () => {
  it('hands the result to the Result screen (safe to read twice, e.g. StrictMode)', () => {
    const s = createSession('story-2', 1)
    s.addAttempt(attempt(0, words('correct', 'correct', 'correct', 'missed'))) // 0.75 → 2 stars
    finishSession(s)
    const expected = { storyId: 'story-2', accuracy: 0.75, stars: 2, practiceWords: ['w3'] }
    expect(resultFor('story-2')).toEqual(expected)
    expect(resultFor('story-2')).toEqual(expected)
  })

  it('gives nothing for a story that was not read (direct link to the Result screen)', () => {
    expect(resultFor('story-3')).toBeUndefined()
  })

  it('refuses an incomplete session', () => {
    const s = createSession('story-1', 2)
    s.addAttempt(attempt(0, words('correct')))
    expect(() => finishSession(s)).toThrow()
  })
})
