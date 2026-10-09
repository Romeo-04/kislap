// Reading screen state machine for one Sentence (issue #3, docs/uml/state.md §1). Pure.

export type ReadingPhase = 'ready' | 'listening' | 'thinking' | 'revealing' | 'reviewed'
export type ReadingNotice =
  | 'reading.silence'
  | 'reading.modelRetry'
  | 'reading.modelUnavailable'
  | 'mic.denied'
  | 'mic.unavailable'

export interface ReadingState {
  phase: ReadingPhase
  /** Words revealed so far (they light up one by one). */
  shown: number
  total: number
  /** This Sentence already has a scored Attempt: a failed retry falls back to it, Next stays. */
  scored: boolean
  /** The model cannot run: the child may move on without a mark. */
  canSkip?: boolean
  notice?: ReadingNotice
}

export type ReadingEvent =
  | { type: 'mic-started' }
  | { type: 'mic-failed'; denied: boolean }
  | { type: 'stopped' }
  | { type: 'silence' }
  | { type: 'failed' }
  | { type: 'model-unavailable' }
  | { type: 'scored'; words: number }
  | { type: 'reveal-tick' }
  | { type: 'next' }

export const initialReading: ReadingState = { phase: 'ready', shown: 0, total: 0, scored: false }

// A kind retry that never marks a word: back to the last marks if there are any, else to ready.
function kindRetry(s: ReadingState, notice: ReadingNotice): ReadingState {
  return s.scored
    ? { phase: 'reviewed', shown: s.total, total: s.total, scored: true, notice }
    : { ...initialReading, canSkip: s.canSkip, notice }
}

export function readingReducer(s: ReadingState, e: ReadingEvent): ReadingState {
  switch (e.type) {
    case 'mic-started':
      return s.phase === 'ready' || s.phase === 'reviewed'
        ? { phase: 'listening', shown: s.shown, total: s.total, scored: s.scored, ...(s.canSkip && { canSkip: true }) }
        : s
    case 'mic-failed':
      return kindRetry(s, e.denied ? 'mic.denied' : 'mic.unavailable')
    case 'stopped': // a second stop in the same frame is ignored
      return s.phase === 'listening' ? { ...s, phase: 'thinking' } : s
    case 'silence':
      return s.phase === 'thinking' ? kindRetry(s, 'reading.silence') : s
    case 'failed': // a model error never marks a word
      return s.phase === 'thinking' ? kindRetry(s, 'reading.modelRetry') : s
    case 'model-unavailable':
      return s.phase === 'thinking' || s.phase === 'revealing' ? s : { ...kindRetry(s, 'reading.modelUnavailable'), canSkip: true }
    case 'scored':
      if (s.phase !== 'thinking') return s
      return e.words > 0
        ? { phase: 'revealing', shown: 0, total: e.words, scored: true }
        : { phase: 'reviewed', shown: 0, total: 0, scored: true }
    case 'reveal-tick': {
      if (s.phase !== 'revealing') return s
      const shown = s.shown + 1
      return { ...s, shown, phase: shown >= s.total ? 'reviewed' : 'revealing' }
    }
    case 'next':
      return s.phase === 'reviewed' || (s.canSkip && s.phase === 'ready') ? initialReading : s
  }
}
