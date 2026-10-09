// Helpers for the model debug pages (/#/asrtest, /#/bench, /#/golden). Not used by the game.
import type { DataType } from '@huggingface/transformers'
import type { FromWorker, ToWorker } from './messages'
import { TIERS, type TierInfo } from './tier'

export const RATE = 16_000

/** Decode an audio file or recording to 16 kHz mono Float32 (the contract format). */
export async function toPcm(blob: Blob): Promise<Float32Array> {
  const ctx = new AudioContext()
  const decoded = await ctx.decodeAudioData(await blob.arrayBuffer())
  await ctx.close()
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * RATE), RATE) // mono + resample
  const src = offline.createBufferSource()
  src.buffer = decoded
  src.connect(offline.destination)
  src.start()
  return (await offline.startRendering()).getChannelData(0)
}

export interface Setup {
  label: string
  tier: TierInfo
  dtype: DataType | Record<string, DataType>
  local?: boolean // load from public/models/<modelId>/ instead of Hugging Face
  fails?: string // known to fail: why. Listed so the result is visible, but off by default.
}

/** Which setups a dev page ticks at first. Local ones need dev-only files; known failures waste a download. */
export const checkedByDefault = (s: Setup): boolean => !s.local && !s.fails

// The local int8 export of whisper-small-fsc. Its files carry no dtype suffix, so dtype is 'fp32'.
const FSC_INT8 = { tier: 'large', modelId: 'whisper-small-fsc-int8', approxMB: 300 } as const

// The unquantized fp32 export (about 1.1 GB, far too big to ship): a speed test for WebGPU.
const FSC_FP32 = { tier: 'large', modelId: 'whisper-small-fsc-fp32', approxMB: 1070 } as const

// Keep the first entry a hosted model: the golden page checks the first setup by default.
export const SETUPS: Setup[] = [
  { label: 'base q8 (WASM)', tier: { ...TIERS.small, device: 'wasm' }, dtype: 'q8' },
  { label: 'base q4 (WebGPU)', tier: { ...TIERS.small, device: 'webgpu' }, dtype: 'q4' },
  // Phone candidate: about 39 MB in total, so it fits the 150 MB phone target.
  { label: 'tiny q8 (WASM)', tier: { ...TIERS.small, modelId: 'onnx-community/whisper-tiny', approxMB: 40, device: 'wasm' }, dtype: 'q8' },
  {
    label: 'small Filipino enc fp32 + dec q4 (WebGPU)',
    tier: { tier: 'large', modelId: 'internetoftim/whisper-small-pld-fil-ONNX', device: 'webgpu', approxMB: 586 },
    dtype: { encoder_model: 'fp32', decoder_model_merged: 'q4' },
    fails: 'downloads 586 MB, then fails: "Missing the following inputs: cache_position"',
  },
  { label: 'small-fsc int8 (local, WASM)', tier: { ...FSC_INT8, device: 'wasm' }, dtype: 'fp32', local: true },
  { label: 'small-fsc int8 (local, WebGPU)', tier: { ...FSC_INT8, device: 'webgpu' }, dtype: 'fp32', local: true },
  { label: 'small-fsc fp32 (local, WebGPU)', tier: { ...FSC_FP32, device: 'webgpu' }, dtype: 'fp32', local: true },
]

export interface Session {
  transcribe(pcm: Float32Array): Promise<{ text: string; ms: number }>
  close(): void
}

// Workers that are open now, so a page can stop them all when the user leaves it.
const live = new Set<Worker>()

/** Stop every open session. Call it when a dev page unmounts; a download would otherwise carry on. */
export function closeAllSessions(): void {
  live.forEach((w) => w.terminate())
  live.clear()
}

/** Start one worker, load a setup, and keep it open so many clips can run on it. */
export function openSession(setup: Setup, onProgress?: (s: string) => void): Promise<Session> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    live.add(worker)
    const pending = new Map<number, { resolve: (r: { text: string; ms: number }) => void; reject: (e: Error) => void }>()
    let nextId = 1
    const fail = (err: Error) => {
      worker.terminate()
      live.delete(worker)
      pending.forEach((p) => p.reject(err))
      reject(err) // no effect once the session has opened; waiting requests were rejected above
    }
    worker.onerror = (e) => fail(new Error(e.message || 'worker crashed'))
    worker.onmessageerror = () => fail(new Error('worker sent an unreadable message'))
    worker.onmessage = (e: MessageEvent<FromWorker>) => {
      const m = e.data
      if (m.type === 'progress') onProgress?.(`${setup.label}: ${m.file} ${(m.loaded / 1e6).toFixed(0)}/${(m.total / 1e6).toFixed(0)} MB`)
      else if (m.type === 'ready') {
        resolve({
          transcribe: (pcm) =>
            new Promise((res, rej) => {
              const id = nextId++
              pending.set(id, { resolve: res, reject: rej })
              worker.postMessage({ type: 'transcribe', id, audio: pcm.slice() } satisfies ToWorker) // copy: the clip is reused
            }),
          close: () => {
            worker.terminate()
            live.delete(worker)
          },
        })
      } else if (m.type === 'result') {
        pending.get(m.id)?.resolve({ text: m.text, ms: m.ms })
        pending.delete(m.id)
      } else if (m.type === 'error') {
        const err = new Error(m.message)
        if (m.id !== undefined) {
          pending.get(m.id)?.reject(err)
          pending.delete(m.id)
        } else fail(err)
      }
    }
    worker.postMessage({ type: 'load', tier: setup.tier, dtype: setup.dtype, local: setup.local } satisfies ToWorker)
  })
}

/** "story-1-5-skip__marcus.m4a" or "story-1-5-skip_marcus.m4a" -> { clip: "story-1-5-skip", reader: "marcus" } */
export function parseName(name: string): { clip: string; reader: string } {
  const base = name.replace(/\.[^.]+$/, '')
  // Clip ids use hyphens only, so the first underscore (one or two) ends the id.
  const [clip, ...rest] = base.split(/_+/)
  return { clip, reader: rest.join('_') || 'unknown' }
}