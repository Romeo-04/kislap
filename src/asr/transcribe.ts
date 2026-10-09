// Main-thread client for the Whisper worker. Contract: docs/architecture.md §3.
// transcribe() loads the model itself, from the Cache API after the first download, so a page
// reload never turns every word into "missed". Fake mode exists only with ?fake in the URL.
//
// The GPU tier (only with ?tier=large, see tier.ts) can fail on a given machine at any time: at load,
// on the first run, or mid-session after a device loss. Any of those switches to the WebAssembly tier once (see fallBackToSmall).
import { loadProgress, saveProgress } from '../game/progress'
import type { FromWorker, ToWorker } from './messages'
import { pickTier, TIERS, type ModelTier, type TierInfo } from './tier'

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
let fallback: Promise<TierInfo> | undefined
let nextId = 1
const pending = new Map<number, Settle<TranscribeResult>>()
let onProgress: ((p: LoadProgress) => void) | undefined
const seenFiles = new Set<string>()
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
 * A dropped connection is not a GPU fault. It must not demote the device to the WebAssembly tier for
 * good, and the WebAssembly tier needs the network just as much, so a fallback would not help.
 */
function isNetworkError(err: unknown): boolean {
  const text = err instanceof Error ? `${err.name} ${err.message}` : String(err)
  return /network|failed to fetch|load failed|net::|offline|timed out|timeout|ERR_INTERNET/i.test(text)
}

/** The tier remembered in on-device progress. It is only set when the GPU tier failed on this device. */
function savedTier(): ModelTier | undefined {
  try {
    return loadProgress().tier
  } catch {
    return undefined // storage can be blocked; the probe decides then
  }
}

function rememberTier(t: ModelTier): void {
  try {
    saveProgress({ ...loadProgress(), tier: t })
  } catch (err) {
    console.warn('Could not save the model tier:', err)
  }
}

/** Lets a person (or the debug page) undo a saved fallback, so the GPU tier is tried again. */
export function forgetSavedTier(): void {
  try {
    const p = loadProgress()
    delete p.tier
    saveProgress(p)
  } catch (err) {
    console.warn('Could not clear the saved model tier:', err)
  }
}

/** The tier in use now, for debug pages. Undefined until the model is loaded. */
export function getActiveTier(): TierInfo | undefined {
  return tier
}

/** The tier remembered after a fallback, for debug pages. */
export function getSavedTier(): ModelTier | undefined {
  return savedTier()
}

/**
 * Reject everything that is waiting, stop the worker, and forget it. The next call starts a fresh
 * worker. It leaves `loading` alone: a load in progress decides for itself whether to fall back.
 */
function dropWorker(err: Error): void {
  worker?.terminate()
  worker = undefined
  tier = undefined
  const waiting = [loadSettle, warmSettle, cachedSettle]
  loadSettle = warmSettle = cachedSettle = undefined
  waiting.forEach((s) => s?.reject(err))
  pending.forEach((p) => p.reject(err))
  pending.clear()
}

/** Like dropWorker, and also forgets a finished or failed load so the next call starts a new one. */
function teardown(err: Error): void {
  loading = undefined
  dropWorker(err)
}

/**
 * The worker died (for example out of memory on a phone). During a load or a fallback, only fail that
 * step and let it decide what to do next: clearing `loading` here would let a second caller start a
 * second load on the same worker while the first is still falling back.
 */
function crash(err: Error): void {
  if (loadSettle || fallback) dropWorker(err)
  else teardown(err)
}

function onMessage(e: MessageEvent<FromWorker>): void {
  const msg = e.data
  switch (msg.type) {
    case 'progress':
      seenFiles.add(msg.file)
      onProgress?.({ loaded: msg.loaded, total: msg.total, file: msg.file })
      break
    case 'ready':
      tier = msg.tier
      console.info(`[model] using the ${msg.tier.tier} tier: ${msg.tier.modelId} on ${msg.tier.device}`)
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

/** Create the worker once. Handlers ignore a worker that has been replaced, so a late event from an old one cannot touch the new one. */
function ensureWorker(): Worker {
  if (worker) return worker
  const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  w.onmessage = (e) => {
    if (w === worker) onMessage(e as MessageEvent<FromWorker>)
  }
  w.onerror = (e) => {
    if (w === worker) crash(new Error(e.message || 'The speech worker crashed'))
  }
  w.onmessageerror = () => {
    if (w === worker) crash(new Error('The speech worker sent an unreadable message'))
  }
  worker = w
  return w
}

function send(msg: ToWorker, transfer: Transferable[] = []): void {
  ensureWorker().postMessage(msg, transfer)
}

/** Ask the worker to load one tier. Resolves when the model is ready. */
function loadTier(picked: TierInfo): Promise<TierInfo> {
  return new Promise<TierInfo>((resolve, reject) => {
    loadSettle = { resolve, reject }
    send({ type: 'load', tier: picked })
  })
}

/**
 * The GPU tier failed on this machine (driver, lost device, out of memory). Start a fresh worker with
 * the WebAssembly tier, and remember it so the next visit does not try the GPU again. Several callers
 * that fail together share one fallback. The caller must not call this for a network error.
 */
function fallBackToSmall(reason: unknown): Promise<TierInfo> {
  fallback ??= (async () => {
    console.warn('The GPU model failed, using WebAssembly instead:', reason)
    // The old tier's files will never finish: zero them so a download bar can still reach 100%.
    seenFiles.forEach((file) => onProgress?.({ loaded: 0, total: 0, file }))
    seenFiles.clear()
    dropWorker(new Error('Replacing the worker after a failed GPU tier'))
    // The old load resolved with the GPU tier, which is gone now. Forget it, so if this fallback fails
    // the next call loads again instead of reusing a load that points at no model.
    loading = undefined
    const small = await loadTier(TIERS.small)
    rememberTier('small')
    return small
  })().finally(() => {
    fallback = undefined
  })
  return fallback
}

async function loadWithFallback(): Promise<TierInfo> {
  const picked = await pickTier(savedTier())
  try {
    return await loadTier(picked)
  } catch (err) {
    if (picked.tier !== 'large' || isNetworkError(err)) throw err
    return fallBackToSmall(err)
  }
}

export function loadModel(progress?: (p: LoadProgress) => void): Promise<TierInfo> {
  if (tier) return Promise.resolve(tier)
  if (progress) onProgress = progress // a second caller without a callback keeps the first one's
  if (fallback) return fallback // a switch to WebAssembly is under way; do not start another load
  loading ??= loadWithFallback().catch((err) => {
    // Let a later call retry instead of caching the failure.
    teardown(err instanceof Error ? err : new Error(String(err)))
    throw err
  })
  return loading
}

function request(audio: Float32Array): Promise<TranscribeResult> {
  const id = nextId++
  const result = new Promise<TranscribeResult>((resolve, reject) => pending.set(id, { resolve, reject }))
  send({ type: 'transcribe', id, audio }, [audio.buffer]) // the buffer moves to the worker
  return result
}

export async function transcribe(audio: Float32Array): Promise<TranscribeResult> {
  if (fakeMode()) {
    await new Promise((r) => setTimeout(r, 600))
    return { text: fakeHeard, ms: 600 }
  }
  await loadModel() // returns at once when loaded; otherwise loads from the cache
  const onGpu = tier?.tier === 'large'
  // Sending moves the audio to the worker, so keep a copy to retry with if the GPU tier fails.
  const spare = onGpu ? audio.slice() : undefined
  try {
    return await request(audio)
  } catch (err) {
    if (!spare || isNetworkError(err)) throw err
    await fallBackToSmall(err)
    return request(spare) // once; a second failure is final
  }
}

/** True when the model files of the chosen tier are all in the Cache API. */
export async function isModelCached(): Promise<boolean> {
  try {
    // During a fallback the answer is about the tier we are switching to, not the one that failed.
    const picked = fallback ? TIERS.small : (tier ?? (await pickTier(savedTier())))
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

function warmOnce(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    warmSettle = { resolve, reject }
    send({ type: 'warmup' })
  })
}

export function warmUp(): Promise<void> {
  if (!tier) return Promise.resolve()
  const onGpu = tier.tier === 'large'
  warming ??= (async () => {
    try {
      await warmOnce()
    } catch (err) {
      if (!onGpu || isNetworkError(err)) throw err
      await fallBackToSmall(err)
      await warmOnce()
    }
  })().finally(() => {
    warming = undefined
  })
  return warming
}
