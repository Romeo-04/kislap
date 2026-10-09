import type { TierInfo } from './tier'

// Messages between transcribe.ts (UI thread) and worker.ts (Web Worker). Contract: architecture §3.
export type ToWorker =
  | { type: 'load'; tier: TierInfo }
  | { type: 'transcribe'; id: number; audio: Float32Array }
  | { type: 'warmup' }

export type FromWorker =
  | { type: 'progress'; loaded: number; total: number; file: string }
  | { type: 'ready'; tier: TierInfo }
  | { type: 'warmed' }
  | { type: 'result'; id: number; text: string; ms: number }
  | { type: 'error'; id?: number; message: string }
