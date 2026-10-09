// Reading speed for parents and teachers: words correct per minute (WCPM), a standard fluency
// measure. Measured on this device from the child's speaking time (silence trimmed). A guide for
// adults, not a test score; it is never shown to the child as a judgement.

/** Seconds from the first to the last frame loud enough to be speech (leading and trailing silence trimmed). */
export function speechSeconds(pcm: Float32Array, rate = 16_000, threshold = 0.02, frameMs = 20): number {
  const frame = Math.max(1, Math.round((rate * frameMs) / 1000))
  let first = -1
  let last = -1
  for (let i = 0, f = 0; i < pcm.length; i += frame, f++) {
    let sum = 0
    const end = Math.min(pcm.length, i + frame)
    for (let j = i; j < end; j++) sum += pcm[j] * pcm[j]
    if (Math.sqrt(sum / (end - i)) >= threshold) {
      if (first < 0) first = f
      last = f
    }
  }
  return first < 0 ? 0 : ((last - first + 1) * frame) / rate
}

/** Words correct per minute, rounded; 0 when no speaking time was measured. */
export function wcpm(correctWords: number, seconds: number): number {
  return seconds > 0 ? Math.round((correctWords * 60) / seconds) : 0
}

export interface ReadingRecord {
  storyId: string
  /** local YYYY-MM-DD */
  date: string
  wcpm: number
  /** 0..1 */
  accuracy: number
}

export const MAX_READINGS = 20
export const MAX_MASTERED = 1000

export function isReadingRecord(v: unknown): v is ReadingRecord {
  if (typeof v !== 'object' || v === null) return false
  const r = v as Record<string, unknown>
  return (
    typeof r.storyId === 'string' &&
    typeof r.date === 'string' &&
    typeof r.wcpm === 'number' && Number.isFinite(r.wcpm) && r.wcpm >= 0 &&
    typeof r.accuracy === 'number' && r.accuracy >= 0 && r.accuracy <= 1
  )
}
