// Main-thread client for the Whisper worker. Contract: docs/architecture.md §3.
// transcribe() loads the model itself, from the Cache API after the first download, so a page
// reload never turns every word into "missed". Fake mode exists only with ?fake in the URL.
import type { FromWorker, ToWorker } from './messages'
import { pickTier, type TierInfo } from './tier'

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

interface Settle<T> {
  resolve: (value: T) => void
  reject: (err: Error) => void
}

let fakeHeard = ''
let worker: Worker | undefined
let tier: TierInfo | undefined
let loading: Promise<TierInfo> | undefined
let warming: Promise<void> | undefined
let nextId = 1
const pending = new Map<number, Settle<TranscribeResult>>()
let onProgress: ((p: LoadProgress) => void) | undefined
let loadSettle: Settle<TierInfo> | undefined
let warmSettle: Settle<void> | undefined
let cachedSettle: Settle<boolean> | undefined

/** Dev only: ?fake in the URL makes transcribe() return setFakeHeard() text without a model. */
function fakeMode(): boolean {
  return typeof location !== 'undefined' && new URLSearchParams(location.search).has('fake')
}

/** Dev helper: set what the fake model "hears" next. */
export function setFakeHeard(text: string): void {
  fakeHeard = text
}

/**
 * Reject everything that is waiting, stop the worker, and forget it. The next call starts a fresh
 * worker. Used for a crash (for example out of memory on a phone) and for a failed load.
 */
function teardown(err: Error): void {
  worker?.terminate()
  worker = undefined
  tier = undefined
  loading = undefined
  warming = undefined
  const waiting = [loadSettle, warmSettle, cachedSettle]
  loadSettle = warmSettle = cachedSettle = undefined
  waiting.forEach((s) => s?.reject(err))
  pending.forEach((p) => p.reject(err))
  pending.clear()
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
    case 'cached':
      cachedSettle?.resolve(msg.value)
      cachedSettle = undefined
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
      } else if (warmSettle) {
        warmSettle.reject(err)
        warmSettle = undefined
      } else if (cachedSettle) {
        cachedSettle.reject(err)
        cachedSettle = undefined
      } else {
        console.error('Speech worker error with no request waiting:', msg.message)
      }
      break
    }
  }
}

/** Create the worker once. The error handlers cover its whole life, not just the load. */
function ensureWorker(): Worker {
  if (worker) return worker
  const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  w.onmessage = onMessage
  w.onerror = (e) => teardown(new Error(e.message || 'The speech worker crashed'))
  w.onmessageerror = () => teardown(new Error('The speech worker sent an unreadable message'))
  worker = w
  return w
}

function send(msg: ToWorker, transfer: Transferable[] = []): void {
  ensureWorker().postMessage(msg, transfer)
}

export function loadModel(progress?: (p: LoadProgress) => void): Promise<TierInfo> {
  if (tier) return Promise.resolve(tier)
  if (progress) onProgress = progress // a second caller without a callback keeps the first one's
  loading ??= pickTier()
    .then(
      (picked) =>
        new Promise<TierInfo>((resolve, reject) => {
          loadSettle = { resolve, reject }
          send({ type: 'load', tier: picked })
        }),
    )
    .catch((err) => {
      // Let a later call retry instead of caching the failure.
      teardown(err instanceof Error ? err : new Error(String(err)))
      throw err
    })
  return loading
}

export async function transcribe(audio: Float32Array): Promise<TranscribeResult> {
  if (fakeMode()) {
    await new Promise((r) => setTimeout(r, 600))
    return { text: fakeHeard, ms: 600 }
  }
  await loadModel() // returns at once when loaded; otherwise loads from the cache
  const id = nextId++
  const result = new Promise<TranscribeResult>((resolve, reject) => pending.set(id, { resolve, reject }))
  send({ type: 'transcribe', id, audio }, [audio.buffer]) // the buffer moves to the worker
  return result
}

/** True when the model files of the chosen tier are all in the Cache API. */
export async function isModelCached(): Promise<boolean> {
  try {
    const picked = tier ?? (await pickTier())
    cachedSettle?.reject(new Error('Superseded by a newer cache check'))
    return await new Promise<boolean>((resolve, reject) => {
      cachedSettle = { resolve, reject }
      send({ type: 'iscached', tier: picked })
    })
  } catch (err) {
    console.warn('Could not check the model cache:', err)
    return false
  }
}

export function warmUp(): Promise<void> {
  if (!tier) return Promise.resolve()
  warming ??= new Promise<void>((resolve, reject) => {
    warmSettle = { resolve, reject }
    send({ type: 'warmup' })
  }).finally(() => {
    warming = undefined
  })
  return warming
}
