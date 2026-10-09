// Loudness helpers for the silence gate and auto-stop (ADR-0006).

/** Clip RMS below this is treated as silence. Tune on real devices. */
export const SILENCE_RMS = 0.01

export function rms(pcm: Float32Array): number {
  if (pcm.length === 0) return 0
  let sum = 0
  for (let i = 0; i < pcm.length; i++) sum += pcm[i] * pcm[i]
  return Math.sqrt(sum / pcm.length)
}

export function isMostlySilence(pcm: Float32Array, threshold = SILENCE_RMS): boolean {
  return rms(pcm) < threshold
}

export interface SilenceDetectorOptions {
  /** Level (RMS of one ~50 ms frame) that counts as speech. */
  threshold: number
  /** Quiet time after speech that ends the recording. */
  silenceMs: number
  /** Hard stop, speech or not. */
  maxMs: number
}

/** Decides when to auto-stop: only after speech started, then `silenceMs` of quiet, or at `maxMs`. */
export function createSilenceDetector({ threshold, silenceMs, maxMs }: SilenceDetectorOptions) {
  let heardSpeech = false
  let lastLoudAt = 0
  return {
    push(level: number, tMs: number): 'continue' | 'stop' {
      if (tMs >= maxMs) return 'stop'
      if (level >= threshold) {
        heardSpeech = true
        lastLoudAt = tMs
        return 'continue'
      }
      return heardSpeech && tMs - lastLoudAt >= silenceMs ? 'stop' : 'continue'
    },
  }
}
