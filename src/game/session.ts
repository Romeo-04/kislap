// Reading session (issue #3): all Attempts on one Story. Contract: docs/architecture.md §3.
import type { WordResult } from '../scoring/score'
import { starsFor, type Stars } from '../scoring/stars'

export interface SentenceAttempt {
  sentenceIndex: number
  heard: string
  words: WordResult[]
  accuracy: number
}

export interface ReadingSession {
  storyId: string
  addAttempt(a: SentenceAttempt): void
  /** (correct + 0.5 × unclear) ÷ Expected words, over the best Attempt of each Sentence. */
  accuracy(): number
  /** Missed and Unclear words from the best Attempts, for Word Pop. */
  practiceWords(): string[]
  isComplete(): boolean
}

export interface SessionResult {
  storyId: string
  accuracy: number
  stars: Stars
  practiceWords: string[]
}

const credit = (w: WordResult) => (w.status === 'correct' ? 1 : w.status === 'unclear' ? 0.5 : 0)

export function createSession(storyId: string, sentenceCount: number): ReadingSession {
  const best = new Map<number, SentenceAttempt>() // a retry never lowers the score
  return {
    storyId,
    addAttempt(a) {
      const prev = best.get(a.sentenceIndex)
      if (!prev || a.accuracy > prev.accuracy) best.set(a.sentenceIndex, a)
    },
    accuracy() {
      const words = [...best.values()].flatMap((a) => a.words)
      return words.length ? words.reduce((s, w) => s + credit(w), 0) / words.length : 0
    },
    practiceWords() {
      return [...best.values()].flatMap((a) => a.words.filter((w) => w.status !== 'correct').map((w) => w.word))
    },
    isComplete() {
      return best.size === sentenceCount
    },
  }
}

// The finished session goes to the Result screen in memory (lost on reload, by design).
// A direct link to the Result screen finds nothing, so it never records Stars or a Sticker
// without reading. Reads are not destructive: StrictMode runs state initializers twice.
const results = new Map<string, SessionResult>()

export function finishSession(session: ReadingSession): SessionResult {
  if (!session.isComplete()) throw new Error('finishSession: not every Sentence has an Attempt')
  const accuracy = session.accuracy()
  const result = { storyId: session.storyId, accuracy, stars: starsFor(accuracy), practiceWords: session.practiceWords() }
  results.set(session.storyId, result)
  return result
}

export function resultFor(storyId: string): SessionResult | undefined {
  return results.get(storyId)
}
