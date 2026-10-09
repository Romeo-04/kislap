// STUB — real Whisper pipeline: issue #14 (model engineer).
// Load with: new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
import type { FromWorker, ToWorker } from './messages'

const ctx = self as unknown as {
  postMessage(msg: FromWorker): void
  onmessage: ((e: MessageEvent<ToWorker>) => void) | null
}

ctx.onmessage = (e) => {
  const msg = e.data
  if (msg.type === 'load') ctx.postMessage({ type: 'ready', tier: msg.tier })
  if (msg.type === 'transcribe') ctx.postMessage({ type: 'result', id: msg.id, text: '', ms: 0 })
}
