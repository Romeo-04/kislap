// Mic check (issue #45): energy only, no speech model. Pure, so it is tested without a microphone.

/** Same "speech" loudness the recorder uses (#2, SPEECH_LEVEL). It sits at 62% of the bar. */
export const LOUD_ENOUGH_RMS = 0.02
const LINE_AT = 0.62
export const BASELINE_MS = 800
export const HEARD_MS = 500
export const SEGMENTS = 10

export type MicCheckPhase = 'baseline' | 'listening' | 'heard' | 'noisy' | 'denied' | 'unavailable'

export interface MicCheckState {
  phase: MicCheckPhase
  startedAt?: number
  baseline: number[]
  overSince?: number
}

export type MicCheckEvent = { type: 'level'; rms: number; at: number } | { type: 'denied' } | { type: 'unavailable' } | { type: 'retry' }

export const initialMicCheck: MicCheckState = { phase: 'baseline', baseline: [] }

export function levelFill(rms: number): number {
  return Math.min(1, Math.max(0, (rms / LOUD_ENOUGH_RMS) * LINE_AT))
}

export function litSegments(fill: number): number {
  return Math.round(Math.min(1, Math.max(0, fill)) * SEGMENTS)
}

export function micCheckReducer(state: MicCheckState, event: MicCheckEvent): MicCheckState {
  if (event.type === 'retry') return initialMicCheck
  if (event.type === 'denied' || event.type === 'unavailable') return { ...initialMicCheck, phase: event.type }
  const { rms, at } = event
  switch (state.phase) {
    case 'baseline': {
      const startedAt = state.startedAt ?? at
      const baseline = [...state.baseline, rms]
      if (at - startedAt < BASELINE_MS) return { ...state, startedAt, baseline }
      // the prompt is hidden until this ends, so loud here is the room, not the child
      // the median, so one cough or door slam does not make a quiet room "noisy"
      const sorted = [...baseline].sort((a, b) => a - b)
      const median = sorted[Math.floor(sorted.length / 2)]
      return median >= LOUD_ENOUGH_RMS ? { ...state, phase: 'noisy', baseline } : { phase: 'listening', startedAt, baseline }
    }
    case 'listening': {
      if (rms < LOUD_ENOUGH_RMS) return { ...state, overSince: undefined }
      const overSince = state.overSince ?? at
      return at - overSince >= HEARD_MS ? { ...state, phase: 'heard', overSince } : { ...state, overSince }
    }
    default:
      return state
  }
}
