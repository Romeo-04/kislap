// Main-thread client for the Whisper worker. Contract: docs/architecture.md §3.
// Fake mode returns FAKE_HEARD after a short delay so the Reading screen can be built now.
// It stays on until loadModel() succeeds, so screens that never load the model keep working.
import type { FromWorker, ToWorker } from './messages'
import { DTYPE, pickTier, type TierInfo } from './tier'

export interface TranscribeResult {
  text: string
  ms: number
  words?: { word: string; start: number; end: number }[]
}

export interface LoadProgress {
  loaded: number
  total: number
  file: string
}

let fakeHeard = ''
let worker: Worker | undefined
let tier: TierInfo | undefined
let loading: Promise<TierInfo> | undefined
let nextId = 1
const pending = new Map<number, { resolve: (r: TranscribeResult) => void; reject: (e: Error) => void }>()
let onProgress: ((p: LoadProgress) => void) | undefined
let loadSettle: { resolve: (t: TierInfo) => void; reject: (e: Error) => void } | undefined
let warmSettle: { resolve: () => void; reject: (e: Error) => void } | undefined

/** Dev helper: set what the fake model "hears" next. */
export function setFakeHeard(text: string): void {
  fakeHeard = text
}

function send(msg: ToWorker, transfer: Transferable[] = []): void {
  worker?.postMessage(msg, transfer)
}

function onMessage(e: MessageEvent<FromWorker>): void {
  const msg = e.data
  switch (msg.type) {
    case 'progress':
      onProgress?.({ loaded: msg.loaded, total: msg.total, file: msg.file })
      break
    case 'ready':
      tier = msg.tier
      loadSettle?.resolve(msg.tier)
      loadSettle = undefined
      break
    case 'warmed':
      warmSettle?.resolve()
      warmSettle = undefined
      break
    case 'result':
      pending.get(msg.id)?.resolve({ text: msg.text, ms: msg.ms })
      pending.delete(msg.id)
      break
    case 'error': {
      const err = new Error(msg.message)
      if (msg.id !== undefined) {
        pending.get(msg.id)?.reject(err)
        pending.delete(msg.id)
      } else if (loadSettle) {
        loadSettle.reject(err)
        loadSettle = undefined
      } else {
        warmSettle?.reject(err)
        warmSettle = undefined
      }
      break
    }
  }
}

export function loadModel(progress?: (p: LoadProgress) => void): Promise<TierInfo> {
  if (tier) return Promise.resolve(tier)
  onProgress = progress
  loading ??= pickTier()
    .then(
      (picked) =>
        new Promise<TierInfo>((resolve, reject) => {
          worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
          worker.onmessage = onMessage
          worker.onerror = (e) => reject(new Error(e.message))
          loadSettle = { resolve, reject }
          send({ type: 'load', tier: picked })
        }),
    )
    .catch((err) => {
      // Let a later call retry instead of caching the failure.
      worker?.terminate()
      worker = undefined
      loading = undefined
      throw err
    })
  return loading
}

export async function transcribe(audio: Float32Array): Promise<TranscribeResult> {
  if (!tier) {
    await new Promise((r) => setTimeout(r, 600))
    return { text: fakeHeard, ms: 600 }
  }
  const id = nextId++
  const result = new Promise<TranscribeResult>((resolve, reject) => pending.set(id, { resolve, reject }))
  send({ type: 'transcribe', id, audio }, [audio.buffer]) // the buffer moves to the worker
  return result
}

/** True when the model files of the chosen tier are all in the Cache API. */
export async function isModelCached(): Promise<boolean> {
  try {
    const { ModelRegistry } = await import('@huggingface/transformers')
    const picked = tier ?? (await pickTier())
    return await ModelRegistry.is_pipeline_cached('automatic-speech-recognition', picked.modelId, {
      dtype: DTYPE[picked.tier] as never,
    })
  } catch {
    return false
  }
}

export function warmUp(): Promise<void> {
  if (!tier) return Promise.resolve()
  return new Promise((resolve, reject) => {
    warmSettle = { resolve, reject }
    send({ type: 'warmup' })
  })
}
