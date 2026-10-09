// Reading session (issue #3): all Attempts on one Story. Contract: docs/architecture.md §3.
import type { WordResult } from '../scoring/score'
import { starsFor, type Stars } from '../scoring/stars'
import { wcpm } from './fluency'

export interface SentenceAttempt {
  sentenceIndex: number
  heard: string
  words: WordResult[]
  accuracy: number
  /** speaking time of this attempt, silence trimmed (for reading speed) */
  seconds?: number
}

export interface ReadingSession {
  storyId: string
  addAttempt(a: SentenceAttempt): void
  /** (correct + 0.5 × unclear) ÷ Expected words, over the best Attempt of each Sentence. */
  accuracy(): number
  /** Missed and Unclear words from the best Attempts, for Word Pop. */
  practiceWords(): string[]
  /** words read correctly in the best attempts (for reading speed and words mastered) */
  correctWords(): string[]
  /** speaking time of the best attempts */
  seconds(): number
  isComplete(): boolean
}

export interface SessionResult {
  storyId: string
  accuracy: number
  stars: Stars
  practiceWords: string[]
  /** words correct per minute; 0 when no speaking time was measured */
  wcpm: number
  correctWords: string[]
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
    correctWords() {
      return [...best.values()].flatMap((a) => a.words.filter((w) => w.status === 'correct').map((w) => w.word))
    },
    seconds() {
      return [...best.values()].reduce((s, a) => s + (a.seconds ?? 0), 0)
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

/** `allowPartial`: only after a Sentence was skipped because the model could not run. */
export function finishSession(session: ReadingSession, opts: { allowPartial?: boolean } = {}): SessionResult {
  if (!session.isComplete() && !opts.allowPartial) throw new Error('finishSession: not every Sentence has an Attempt')
  const accuracy = session.accuracy()
  const correct = session.correctWords()
  const result = {
    storyId: session.storyId,
    accuracy,
    stars: starsFor(accuracy),
    practiceWords: session.practiceWords(),
    wcpm: wcpm(correct.length, session.seconds()),
    correctWords: correct,
  }
  results.set(session.storyId, result)
  return result
}

export function resultFor(storyId: string): SessionResult | undefined {
  return results.get(storyId)
}

/** Call once the result is saved, so Back or a reload never records it twice. */
export function clearResult(storyId: string): void {
  results.delete(storyId)
}
