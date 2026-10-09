// STUB — real normalize/align/score: issue #20 (content-QA). Contract: docs/architecture.md §3.
// This naive version marks a word correct only if it appears in the heard text.

export type WordStatus = 'correct' | 'unclear' | 'missed'

export interface WordResult {
  word: string
  status: WordStatus
  heard?: string
  similarity: number
}

export function scoreReading(expectedText: string, heardText: string): { words: WordResult[]; accuracy: number } {
  const clean = (s: string) => s.toLowerCase().replace(/[^\p{L}\s-]/gu, '').split(/\s+/).filter(Boolean)
  const heard = new Set(clean(heardText))
  const words: WordResult[] = expectedText
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const hit = heard.has(clean(word)[0] ?? '')
      return { word, status: hit ? 'correct' : 'missed', similarity: hit ? 1 : 0 }
    })
  const correct = words.filter((w) => w.status === 'correct').length
  return { words, accuracy: words.length ? correct / words.length : 0 }
}
