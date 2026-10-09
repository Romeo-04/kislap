import type { DataType } from '@huggingface/transformers'
import type { TierInfo } from './tier'

// Messages between transcribe.ts (UI thread) and worker.ts (Web Worker). Contract: architecture §3.
export type ToWorker =
  // dtype overrides the tier default. Only the benchmark page (#15) sets it.
  | { type: 'load'; tier: TierInfo; dtype?: DataType | Record<string, DataType> }
  | { type: 'transcribe'; id: number; audio: Float32Array }
  | { type: 'warmup' }
  | { type: 'iscached'; tier: TierInfo }

export type FromWorker =
  | { type: 'progress'; loaded: number; total: number; file: string }
  | { type: 'ready'; tier: TierInfo }
  | { type: 'warmed' }
  | { type: 'cached'; value: boolean }
  | { type: 'result'; id: number; text: string; ms: number }
  | { type: 'error'; id?: number; message: string }
