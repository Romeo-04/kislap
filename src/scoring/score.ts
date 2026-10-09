import { align, similarity } from './align'
import { SCORING } from './config'
import { normalize, tokenize } from './normalize'

export type WordStatus = 'correct' | 'unclear' | 'missed'

export interface WordResult {
  /** Original story spelling and punctuation, for word highlighting. */
  word: string
  status: WordStatus
  heard?: string // Normalized matched word; absent when the alignment has a gap.
  similarity: number
}

export function scoreReading(expectedText: string, heardText: string): { words: WordResult[]; accuracy: number } {
  const expected = tokenize(expectedText)
  const heard = normalize(heardText)
  const words: WordResult[] = []
  let credit = 0

  for (const [expectedIndex, heardIndex] of align(expected.map((word) => word.normalized), heard)) {
    // Extra speech affects alignment only, never the accuracy denominator.
    if (expectedIndex === null) continue
    const word = expected[expectedIndex]
    const matched = heardIndex === null ? undefined : heard[heardIndex]
    const closeness = matched === undefined ? 0 : similarity(word.normalized, matched)
    const status: WordStatus = closeness >= SCORING.correct ? 'correct' : closeness >= SCORING.unclear ? 'unclear' : 'missed'
    credit += status === 'correct' ? 1 : status === 'unclear' ? 0.5 : 0
    words.push({ word: word.word, status, similarity: closeness, ...(matched === undefined ? {} : { heard: matched }) })
  }
  return { words, accuracy: words.length ? credit / words.length : 0 }
}
