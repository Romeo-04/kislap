// STUB — real implementation: issue #2 (lead). Contract: docs/architecture.md §3.
// The fake recorder returns 1 s of silence so screens can be built without a microphone.

export interface Recorder {
  start(): Promise<void>
  stop(): Promise<Float32Array> // 16 kHz mono PCM
  onLevel(cb: (rms: number) => void): () => void
}

export const SAMPLE_RATE = 16_000

export function createRecorder(_opts?: { autoStopSilenceMs?: number }): Recorder {
  const listeners = new Set<(rms: number) => void>()
  let timer: ReturnType<typeof setInterval> | undefined
  return {
    async start() {
      timer = setInterval(() => listeners.forEach((cb) => cb(Math.random() * 0.2)), 50)
    },
    async stop() {
      clearInterval(timer)
      return new Float32Array(SAMPLE_RATE)
    },
    onLevel(cb) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
  }
}
