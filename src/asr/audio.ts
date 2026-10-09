// Microphone capture → 16 kHz mono Float32Array for Whisper (issue #2, ADR-0006).
// Pure logic (resample, silence detection) lives in resample.ts and meter.ts and is unit tested.
import { createSilenceDetector, rms } from './meter'
import { concatChunks, resample } from './resample'

export const SAMPLE_RATE = 16_000

/** Frame level (RMS) that counts as speech for auto-stop. Tune on the Poco X6 Pro. */
export const SPEECH_LEVEL = 0.02

export interface Recorder {
  start(): Promise<void>
  stop(): Promise<Float32Array> // 16 kHz mono PCM
  onLevel(cb: (rms: number) => void): () => void
  /** Fires when silence after speech (or the time limit) ends the recording. Call stop() then. */
  onAutoStop(cb: () => void): () => void
  /** Releases the microphone (call when leaving the reading screen). */
  release(): void
}

export interface RecorderOptions {
  autoStopSilenceMs?: number
  maxMs?: number
}

export type MicErrorKind = 'denied' | 'unavailable'

export class MicError extends Error {
  readonly kind: MicErrorKind
  constructor(kind: MicErrorKind, message: string) {
    super(message)
    this.kind = kind
  }
}

let sharedStream: MediaStream | undefined
let sharedCtx: AudioContext | undefined

// Ask for the mic once and reuse the stream, so the child sees one permission prompt.
let pendingStream: Promise<MediaStream> | undefined

function getStream(): Promise<MediaStream> {
  if (sharedStream?.active) return Promise.resolve(sharedStream)
  // Share one in-flight request so two callers never open two mic streams.
  pendingStream ??= openStream().finally(() => (pendingStream = undefined))
  return pendingStream
}

async function openStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) throw new MicError('unavailable', 'getUserMedia not available (needs HTTPS)')
  try {
    sharedStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    })
    return sharedStream
  } catch (err) {
    const name = (err as DOMException).name
    const kind = name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable'
    throw new MicError(kind, (err as Error).message)
  }
}

export function createRecorder(opts: RecorderOptions = {}): Recorder {
  const { autoStopSilenceMs = 1500, maxMs = 15_000 } = opts
  const levelListeners = new Set<(rms: number) => void>()
  const stopListeners = new Set<() => void>()
  let chunks: Float32Array[] = []
  let source: MediaStreamAudioSourceNode | undefined
  let processor: ScriptProcessorNode | undefined
  let starting: Promise<void> | undefined // a double tap must not build two pipelines
  let generation = 0 // bumped by release(): a start() still waiting on the mic prompt must not connect

  const disconnect = () => {
    processor?.disconnect()
    source?.disconnect()
    if (processor) processor.onaudioprocess = null
    processor = undefined
    source = undefined
  }

  const begin = async () => {
    disconnect()
    const gen = generation
    const stream = await getStream()
    if (gen !== generation) {
      stream.getTracks().forEach((t) => t.stop())
      sharedStream = undefined
      return
    }
    sharedCtx ??= new AudioContext()
    const ctx = sharedCtx
    await ctx.resume()
    chunks = []
    const detector = createSilenceDetector({ threshold: SPEECH_LEVEL, silenceMs: autoStopSilenceMs, maxMs })
    const startedAt = performance.now()
    let autoStopped = false

    source = ctx.createMediaStreamSource(stream)
    // ScriptProcessorNode is deprecated but works on every target browser and needs no extra module file.
    processor = ctx.createScriptProcessor(2048, 1, 1)
    processor.onaudioprocess = (e) => {
      const frame = e.inputBuffer.getChannelData(0).slice()
      chunks.push(frame)
      const level = rms(frame)
      levelListeners.forEach((cb) => cb(level))
      if (!autoStopped && detector.push(level, performance.now() - startedAt) === 'stop') {
        autoStopped = true
        stopListeners.forEach((cb) => cb())
      }
    }
    source.connect(processor)
    processor.connect(ctx.destination) // Chrome only fires onaudioprocess when connected; output stays silent
  }

  return {
    start() {
      starting ??= begin().finally(() => (starting = undefined))
      return starting
    },


    async stop() {
      disconnect()
      const rate = sharedCtx?.sampleRate ?? SAMPLE_RATE
      const pcm = resample(concatChunks(chunks), rate, SAMPLE_RATE)
      chunks = []
      return pcm
    },

    onLevel(cb) {
      levelListeners.add(cb)
      return () => levelListeners.delete(cb)
    },

    onAutoStop(cb) {
      stopListeners.add(cb)
      return () => stopListeners.delete(cb)
    },

    release() {
      generation++
      disconnect()
      sharedStream?.getTracks().forEach((t) => t.stop())
      sharedStream = undefined
    },
  }
}
