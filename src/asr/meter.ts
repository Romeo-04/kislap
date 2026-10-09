// Loudness helpers for the silence gate (ADR-0006). Tune the threshold in issue #2.

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
