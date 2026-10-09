// STUB — real session logic: issue #3 (lead). Contract: docs/architecture.md §3.
import type { WordResult } from '../scoring/score'

export interface SentenceAttempt {
  sentenceIndex: number
  heard: string
  words: WordResult[]
  accuracy: number
}

export interface ReadingSession {
  storyId: string
  attempts: SentenceAttempt[]
  accuracy(): number
  practiceWords(): string[]
}

export function createSession(storyId: string): ReadingSession {
  const attempts: SentenceAttempt[] = []
  // Best attempt per sentence counts.
  const best = () => {
    const bySentence = new Map<number, SentenceAttempt>()
    for (const a of attempts) {
      const prev = bySentence.get(a.sentenceIndex)
      if (!prev || a.accuracy > prev.accuracy) bySentence.set(a.sentenceIndex, a)
    }
    return [...bySentence.values()]
  }
  return {
    storyId,
    attempts,
    accuracy() {
      const b = best()
      return b.length ? b.reduce((s, a) => s + a.accuracy, 0) / b.length : 0
    },
    practiceWords() {
      return best().flatMap((a) => a.words.filter((w) => w.status !== 'correct').map((w) => w.word))
    },
  }
}
