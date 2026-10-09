import { similarity } from './align'
import { SCORING } from './config'
import { canonical, normalize, tokenize } from './normalize'

export type WordStatus = 'correct' | 'unclear' | 'missed'

export interface WordResult {
  /** Original story spelling and punctuation, for word highlighting. */
  word: string
  status: WordStatus
  heard?: string // Normalized heard text matched to this word (two heard words joined if Whisper split it).
  similarity: number
}

// ñ and accents are folded only for comparison; Whisper often drops them.
const fold = (w: string) => w.normalize('NFD').replace(/\p{M}/gu, '')

/** Spelling similarity, or a full match when both words stand for the same number. */
function wordSimilarity(expected: string, heard: string): number {
  const c = canonical(expected)
  if (c.startsWith('#') && c === canonical(heard)) return 1
  return similarity(fold(expected), fold(heard))
}

type Step = 'pair' | 'skip' | 'extra' | 'split' | 'join'

/**
 * Word alignment with two extra moves for ASR spacing errors:
 * split = one expected word heard as two ("dahan-dahan" → "dahan dahan"),
 * join  = two expected words heard as one ("story time" → "storytime").
 */
function alignScored(expected: string[], heard: string[]): Array<{ heard?: string; similarity: number }> {
  const n = expected.length
  const m = heard.length
  const cost = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(Infinity))
  const step = Array.from({ length: n + 1 }, () => Array<Step>(m + 1))
  cost[0][0] = 0
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      if (i === 0 && j === 0) continue
      const options: Array<[number, Step]> = []
      if (i > 0 && j > 0) options.push([cost[i - 1][j - 1] + 1 - wordSimilarity(expected[i - 1], heard[j - 1]), 'pair'])
      // Split and join exist only for real spacing errors: the joined form must be a very close match (SCORING.spacing).
      if (i > 0 && j > 1) {
        const sim = wordSimilarity(expected[i - 1], heard[j - 2] + heard[j - 1])
        if (sim >= SCORING.spacing) options.push([cost[i - 1][j - 2] + 1 - sim, 'split'])
      }
      if (i > 1 && j > 0) {
        const sim = wordSimilarity(expected[i - 2] + expected[i - 1], heard[j - 1])
        if (sim >= SCORING.spacing) options.push([cost[i - 2][j - 1] + 2 * (1 - sim), 'join'])
      }
      if (i > 0) options.push([cost[i - 1][j] + 1, 'skip'])
      if (j > 0) options.push([cost[i][j - 1] + 1, 'extra'])
      // Ties prefer the order above (a plain pair first), so equal-cost paths are deterministic.
      for (const [c, s] of options) {
        if (c < cost[i][j] - 1e-9) {
          cost[i][j] = c
          step[i][j] = s
        }
      }
    }
  }

  const out: Array<{ heard?: string; similarity: number }> = Array.from({ length: n }, () => ({ similarity: 0 }))
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    const s = step[i][j]
    if (s === 'pair') {
      out[i - 1] = { heard: heard[j - 1], similarity: wordSimilarity(expected[i - 1], heard[j - 1]) }
      i--
      j--
    } else if (s === 'split') {
      const h = heard[j - 2] + heard[j - 1]
      out[i - 1] = { heard: h, similarity: wordSimilarity(expected[i - 1], h) }
      i--
      j -= 2
    } else if (s === 'join') {
      const sim = wordSimilarity(expected[i - 2] + expected[i - 1], heard[j - 1])
      out[i - 2] = { heard: heard[j - 1], similarity: sim }
      out[i - 1] = { heard: heard[j - 1], similarity: sim }
      i -= 2
      j--
    } else if (s === 'skip') i--
    else j--
  }
  return out
}

export function scoreReading(expectedText: string, heardText: string): { words: WordResult[]; accuracy: number } {
  const expected = tokenize(expectedText)
  const heard = normalize(heardText)
  const aligned = alignScored(expected.map((w) => w.normalized), heard)
  let credit = 0
  // Extra speech affects alignment only, never the accuracy denominator.
  const words = expected.map((w, k): WordResult => {
    const { heard: matched, similarity: closeness } = aligned[k]
    const status: WordStatus = closeness >= SCORING.correct ? 'correct' : closeness >= SCORING.unclear ? 'unclear' : 'missed'
    credit += status === 'correct' ? 1 : status === 'unclear' ? 0.5 : 0
    return { word: w.word, status, similarity: closeness, ...(matched === undefined ? {} : { heard: matched }) }
  })
  return { words, accuracy: words.length ? credit / words.length : 0 }
}
