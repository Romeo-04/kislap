// Whisper in a Web Worker (ADR-0004). Contract: docs/architecture.md §3.
// Load with: new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
import { env, pipeline, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers'
import type { FromWorker, ToWorker } from './messages'
import { DTYPE } from './tier'

const ctx = self as unknown as {
  postMessage(msg: FromWorker): void
  onmessage: ((e: MessageEvent<ToWorker>) => void) | null
}

// Model files come from the Hugging Face Hub once, then from the Cache API (ADR-0007).
env.allowLocalModels = false
env.useBrowserCache = true

let asr: AutomaticSpeechRecognitionPipeline | undefined
// Requests run one at a time: a second inference would fight the first for the same session.
let queue: Promise<void> = Promise.resolve()

async function load(msg: Extract<ToWorker, { type: 'load' }>): Promise<void> {
  const { tier } = msg
  asr = (await pipeline('automatic-speech-recognition', tier.modelId, {
    device: tier.device,
    dtype: DTYPE[tier.tier] as never,
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
  const out = await asr(audio, { language: 'tagalog', task: 'transcribe' })
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
      }
    } catch (err) {
      const id = msg.type === 'transcribe' ? msg.id : undefined
      ctx.postMessage({ type: 'error', id, message: err instanceof Error ? err.message : String(err) })
    }
  })
}
