// Helpers for the model debug pages (/#/asrtest, /#/bench, /#/golden). Not used by the game.
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
  dtype: string | Record<string, string>
}

export const SETUPS: Setup[] = [
  { label: 'base q8 (WASM)', tier: { ...TIERS.small, device: 'wasm' }, dtype: 'q8' },
  { label: 'base q4 (WebGPU)', tier: { ...TIERS.small, device: 'webgpu' }, dtype: 'q4' },
  {
    label: 'small Filipino enc fp32 + dec q4 (WebGPU)',
    tier: TIERS.large,
    dtype: { encoder_model: 'fp32', decoder_model_merged: 'q4' },
  },
]

export interface Session {
  transcribe(pcm: Float32Array): Promise<{ text: string; ms: number }>
  close(): void
}

/** Start one worker, load a setup, and keep it open so many clips can run on it. */
export function openSession(setup: Setup, onProgress?: (s: string) => void): Promise<Session> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    const pending = new Map<number, { resolve: (r: { text: string; ms: number }) => void; reject: (e: Error) => void }>()
    let nextId = 1
    const fail = (err: Error) => {
      worker.terminate()
      pending.forEach((p) => p.reject(err))
      reject(err)
    }
    worker.onerror = (e) => fail(new Error(e.message || 'worker crashed'))
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
          close: () => worker.terminate(),
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
    worker.postMessage({ type: 'load', tier: setup.tier, dtype: setup.dtype } satisfies ToWorker)
  })
}
