// Reading screen state machine for one Sentence (issue #3, docs/uml/state.md §1). Pure.

export type ReadingPhase = 'ready' | 'listening' | 'thinking' | 'revealing' | 'reviewed'
export type ReadingNotice = 'reading.silence' | 'reading.modelRetry' | 'mic.denied' | 'mic.unavailable'

export interface ReadingState {
  phase: ReadingPhase
  /** Words revealed so far (they light up one by one). */
  shown: number
  total: number
  notice?: ReadingNotice
}

export type ReadingEvent =
  | { type: 'mic-started' }
  | { type: 'mic-failed'; denied: boolean }
  | { type: 'stopped' }
  | { type: 'silence' }
  | { type: 'failed' }
  | { type: 'scored'; words: number }
  | { type: 'reveal-tick' }
  | { type: 'next' }

export const initialReading: ReadingState = { phase: 'ready', shown: 0, total: 0 }

export function readingReducer(s: ReadingState, e: ReadingEvent): ReadingState {
  switch (e.type) {
    case 'mic-started':
      return s.phase === 'ready' || s.phase === 'reviewed' ? { phase: 'listening', shown: 0, total: 0 } : s
    case 'mic-failed':
      return { ...initialReading, notice: e.denied ? 'mic.denied' : 'mic.unavailable' }
    case 'stopped': // a second stop in the same frame is ignored
      return s.phase === 'listening' ? { ...s, phase: 'thinking' } : s
    case 'silence':
      return s.phase === 'thinking' ? { ...initialReading, notice: 'reading.silence' } : s
    case 'failed': // a model error never marks a word
      return s.phase === 'thinking' ? { ...initialReading, notice: 'reading.modelRetry' } : s
    case 'scored':
      if (s.phase !== 'thinking') return s
      return e.words > 0 ? { phase: 'revealing', shown: 0, total: e.words } : { phase: 'reviewed', shown: 0, total: 0 }
    case 'reveal-tick': {
      if (s.phase !== 'revealing') return s
      const shown = s.shown + 1
      return { ...s, shown, phase: shown >= s.total ? 'reviewed' : 'revealing' }
    }
    case 'next':
      return s.phase === 'reviewed' ? initialReading : s
  }
}
