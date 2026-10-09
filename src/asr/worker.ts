// Whisper in a Web Worker (ADR-0004). Contract: docs/architecture.md §3.
// Load with: new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
import { env, ModelRegistry, pipeline, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers'
import type { FromWorker, ToWorker } from './messages'
import { DTYPE } from './tier'

const ctx = self as unknown as {
  postMessage(msg: FromWorker): void
  onmessage: ((e: MessageEvent<ToWorker>) => void) | null
}

// Model files come from the Hugging Face Hub once, then from the Cache API (ADR-0007).
env.allowLocalModels = false
env.useBrowserCache = true

// ONNX Runtime must load its WASM runtime from our own site. Left unset, Transformers.js points it
// at cdn.jsdelivr.net, a third-party request that breaks ADR-0007 and the offline promise.
// Vite copies these two files into the build and gives us their URLs.
env.backends.onnx.wasm!.wasmPaths = {
  mjs: new URL('../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.mjs', import.meta.url).href,
  wasm: new URL('../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.wasm', import.meta.url).href,
}

const MAX_NEW_TOKENS = 64

let asr: AutomaticSpeechRecognitionPipeline | undefined
// Requests run one at a time: a second inference would fight the first for the same session.
let queue: Promise<void> = Promise.resolve()

async function load(msg: Extract<ToWorker, { type: 'load' }>): Promise<void> {
  const { tier } = msg
  asr = (await pipeline('automatic-speech-recognition', tier.modelId, {
    device: tier.device,
    dtype: msg.dtype ?? DTYPE[tier.tier],
    progress_callback: (p) => {
      if (p.status === 'progress') {
        ctx.postMessage({ type: 'progress', loaded: p.loaded, total: p.total, file: p.file })
      }
    },
  })) as AutomaticSpeechRecognitionPipeline
  ctx.postMessage({ type: 'ready', tier })
}

async function run(audio: Float32Array): Promise<{ text: string; ms: number }> {
  if (!asr) throw new Error('Model is not loaded')
  const t0 = performance.now()
  // The cap stops a runaway repeat ("duh-duh-duh...") that took 23 s in testing. A story sentence is
  // at most 10 words, about 40 tokens, so 64 never cuts a real answer short.
  const out = await asr(audio, { language: 'tagalog', task: 'transcribe', max_new_tokens: MAX_NEW_TOKENS })
  const text = (Array.isArray(out) ? out[0]?.text : out.text) ?? ''
  return { text: text.trim(), ms: Math.round(performance.now() - t0) }
}

ctx.onmessage = (e) => {
  const msg = e.data
  queue = queue.then(async () => {
    try {
      if (msg.type === 'load') await load(msg)
      else if (msg.type === 'transcribe') {
        const { text, ms } = await run(msg.audio)
        ctx.postMessage({ type: 'result', id: msg.id, text, ms })
      } else if (msg.type === 'warmup') {
        // One second of silence primes the kernels so the first real sentence is fast.
        await run(new Float32Array(16_000))
        ctx.postMessage({ type: 'warmed' })
      } else if (msg.type === 'iscached') {
        // Asked here, not on the UI thread, so the library stays out of the main bundle.
        const value = await ModelRegistry.is_pipeline_cached('automatic-speech-recognition', msg.tier.modelId, {
          dtype: DTYPE[msg.tier.tier],
        })
        ctx.postMessage({ type: 'cached', value })
      }
    } catch (err) {
      const id = msg.type === 'transcribe' ? msg.id : undefined
      // Keep the error name (TypeError, RuntimeError...) so a log says more than the bare message.
      const message = err instanceof Error ? (err.name !== 'Error' ? `${err.name}: ${err.message}` : err.message) : String(err)
      ctx.postMessage({ type: 'error', id, message })
    }
  })
}
