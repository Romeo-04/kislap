import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FromWorker, ToWorker } from './messages'
import { TIERS } from './tier'

// A stand-in for the browser Worker: tests read what the client sent and answer by hand.
class FakeWorker {
  static all: FakeWorker[] = []
  sent: { msg: ToWorker; transfer?: Transferable[] }[] = []
  terminated = false
  onmessage: ((e: MessageEvent<FromWorker>) => void) | null = null
  onerror: ((e: ErrorEvent) => void) | null = null
  onmessageerror: (() => void) | null = null
  constructor() {
    FakeWorker.all.push(this)
  }
  postMessage(msg: ToWorker, transfer?: Transferable[]) {
    this.sent.push({ msg, transfer })
  }
  terminate() {
    this.terminated = true
  }
  reply(msg: FromWorker) {
    this.onmessage?.({ data: msg } as MessageEvent<FromWorker>)
  }
  crash(message = 'out of memory') {
    this.onerror?.({ message } as ErrorEvent)
  }
  types() {
    return this.sent.map((s) => s.msg.type)
  }
}

const small = TIERS.small
let client: typeof import('./transcribe')

/** Let queued promise callbacks run (pickTier is async). */
const tick = () => new Promise((r) => setTimeout(r, 0))

/** Load the model through the fake worker and return it. */
async function loaded(): Promise<FakeWorker> {
  const p = client.loadModel()
  await tick()
  const w = FakeWorker.all.at(-1)!
  w.reply({ type: 'ready', tier: small })
  await p
  return w
}

beforeEach(async () => {
  FakeWorker.all = []
  vi.stubGlobal('Worker', FakeWorker)
  vi.stubGlobal('location', { search: '' })
  vi.resetModules() // the client keeps module state; each test gets a fresh copy
  client = await import('./transcribe')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('transcribe client', () => {
  it('loads the model by itself when transcribe is called first', async () => {
    const audio = new Float32Array(16)
    const p = client.transcribe(audio)
    await tick()
    const w = FakeWorker.all[0]
    expect(w.types()).toEqual(['load'])
    w.reply({ type: 'ready', tier: small })
    await tick()
    expect(w.types()).toEqual(['load', 'transcribe'])
    w.reply({ type: 'result', id: 1, text: 'si Mimi', ms: 5 })
    await expect(p).resolves.toMatchObject({ text: 'si Mimi', ms: 5 })
  })

  it('moves the audio buffer to the worker instead of copying it', async () => {
    const w = await loaded()
    const audio = new Float32Array(16)
    const buffer = audio.buffer
    void client.transcribe(audio)
    await tick()
    expect(w.sent.at(-1)!.transfer).toEqual([buffer])
  })

  it('matches each result to its request by id', async () => {
    const w = await loaded()
    const a = client.transcribe(new Float32Array(1))
    const b = client.transcribe(new Float32Array(1))
    await tick()
    const [idA, idB] = w.sent.filter((s) => s.msg.type === 'transcribe').map((s) => (s.msg as { id: number }).id)
    w.reply({ type: 'result', id: idB, text: 'second', ms: 1 })
    w.reply({ type: 'result', id: idA, text: 'first', ms: 1 })
    await expect(a).resolves.toMatchObject({ text: 'first' })
    await expect(b).resolves.toMatchObject({ text: 'second' })
  })

  it('rejects only the request that failed', async () => {
    const w = await loaded()
    const a = client.transcribe(new Float32Array(1))
    const b = client.transcribe(new Float32Array(1))
    await tick()
    w.reply({ type: 'error', id: 1, message: 'bad audio' })
    w.reply({ type: 'result', id: 2, text: 'ok', ms: 1 })
    await expect(a).rejects.toThrow('bad audio')
    await expect(b).resolves.toMatchObject({ text: 'ok' })
  })

  it('rejects every waiting request when the worker crashes after loading', async () => {
    const w = await loaded()
    const a = client.transcribe(new Float32Array(1))
    const b = client.transcribe(new Float32Array(1))
    await tick()
    w.crash()
    await expect(a).rejects.toThrow('out of memory')
    await expect(b).rejects.toThrow('out of memory')
    expect(w.terminated).toBe(true)
  })

  it('starts a fresh worker after a crash', async () => {
    const first = await loaded()
    first.crash()
    const second = await loaded()
    expect(second).not.toBe(first)
    expect(FakeWorker.all).toHaveLength(2)
  })

  it('lets a failed load be retried', async () => {
    const p = client.loadModel()
    await tick()
    FakeWorker.all[0].reply({ type: 'error', message: 'network error' })
    await expect(p).rejects.toThrow('network error')
    const second = await loaded()
    expect(FakeWorker.all).toHaveLength(2)
    expect(second.types()).toEqual(['load'])
  })

  it('sends one warm-up for two warmUp calls', async () => {
    const w = await loaded()
    const a = client.warmUp()
    const b = client.warmUp()
    await tick()
    expect(w.types().filter((t) => t === 'warmup')).toHaveLength(1)
    w.reply({ type: 'warmed' })
    await Promise.all([a, b])
  })

  it('asks the worker whether the model is cached', async () => {
    const p = client.isModelCached()
    await tick()
    const w = FakeWorker.all[0]
    expect(w.types()).toEqual(['iscached'])
    w.reply({ type: 'cached', value: true })
    await expect(p).resolves.toBe(true)
  })

  it('answers false and does not throw when the cache check fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const p = client.isModelCached()
    await tick()
    FakeWorker.all[0].reply({ type: 'error', message: 'cache blocked' })
    await expect(p).resolves.toBe(false)
    expect(warn).toHaveBeenCalled()
  })
})

describe('fake mode', () => {
  it('is off by default: no ?fake means the real model is used', async () => {
    client.setFakeHeard('should not be returned')
    void client.transcribe(new Float32Array(1))
    await tick()
    expect(FakeWorker.all[0].types()).toEqual(['load'])
  })

  it('returns the fake text without a worker when ?fake is in the URL', async () => {
    vi.stubGlobal('location', { search: '?fake=1' })
    client.setFakeHeard('si Mimi ay')
    await expect(client.transcribe(new Float32Array(1))).resolves.toMatchObject({ text: 'si Mimi ay' })
    expect(FakeWorker.all).toHaveLength(0)
  })
})

describe('tier choice and fallback', () => {
  const desktop = { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', gpu: { requestAdapter: async () => ({}) } }
  const phone = { userAgent: 'Mozilla/5.0 (Linux; Android 15) Mobile Safari/537.36', gpu: { requestAdapter: async () => ({}) } }
  let store: Record<string, string>

  beforeEach(() => {
    store = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => void (store[k] = v),
    })
  })

  const loadMsg = (w: FakeWorker) => w.sent.find((s) => s.msg.type === 'load')!.msg as Extract<ToWorker, { type: 'load' }>

  it('asks for the GPU tier on a desktop with WebGPU', async () => {
    vi.stubGlobal('navigator', desktop)
    void client.loadModel()
    await tick()
    expect(loadMsg(FakeWorker.all[0]).tier).toEqual(TIERS.large)
  })

  it('asks for the WebAssembly tier on a phone, even with WebGPU', async () => {
    vi.stubGlobal('navigator', phone)
    void client.loadModel()
    await tick()
    expect(loadMsg(FakeWorker.all[0]).tier).toEqual(TIERS.small)
  })

  it('falls back to WebAssembly in a fresh worker when the GPU model fails, and remembers it', async () => {
    vi.stubGlobal('navigator', desktop)
    const p = client.loadModel()
    await tick()
    FakeWorker.all[0].reply({ type: 'error', message: 'GPU device lost' })
    await tick()
    const second = FakeWorker.all[1]
    expect(FakeWorker.all[0].terminated).toBe(true)
    expect(loadMsg(second).tier).toEqual(TIERS.small)
    second.reply({ type: 'ready', tier: TIERS.small })
    await expect(p).resolves.toEqual(TIERS.small)
    expect(JSON.parse(store['kislap.progress.v1']).tier).toBe('small')
  })

  it('uses the remembered tier next time, without trying the GPU', async () => {
    vi.stubGlobal('navigator', desktop)
    store['kislap.progress.v1'] = JSON.stringify({ version: 1, tier: 'small' })
    void client.loadModel()
    await tick()
    expect(loadMsg(FakeWorker.all[0]).tier).toEqual(TIERS.small)
  })

  it('does not fall back when the WebAssembly tier itself fails', async () => {
    vi.stubGlobal('navigator', phone)
    const p = client.loadModel()
    await tick()
    FakeWorker.all[0].reply({ type: 'error', message: 'network error' })
    await expect(p).rejects.toThrow('network error')
    expect(FakeWorker.all).toHaveLength(1)
  })
})
describe('GPU tier failures after loading', () => {
  const desktop = { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', maxTouchPoints: 0, gpu: { requestAdapter: async () => ({}) } }
  let store: Record<string, string>

  beforeEach(() => {
    store = {}
    vi.stubGlobal('navigator', desktop)
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => void (store[k] = v),
    })
  })

  const savedTier = () => (store['kislap.progress.v1'] ? JSON.parse(store['kislap.progress.v1']).tier : undefined)
  const sentTypes = (w: FakeWorker) => w.sent.map((s) => s.msg.type)

  /** Load the GPU tier on the first fake worker and return it. */
  async function loadedOnGpu(): Promise<FakeWorker> {
    const p = client.loadModel()
    await tick()
    const w = FakeWorker.all[0]
    w.reply({ type: 'ready', tier: TIERS.large })
    await p
    return w
  }

  it('falls back to WebAssembly when the first transcription fails on the GPU, and retries once', async () => {
    const w0 = await loadedOnGpu()
    const result = client.transcribe(new Float32Array(8).fill(0.5))
    await tick()
    w0.reply({ type: 'error', id: 1, message: 'GPU device lost' })
    await tick()
    const w1 = FakeWorker.all[1]
    expect(w0.terminated).toBe(true)
    expect(sentTypes(w1)).toEqual(['load'])
    w1.reply({ type: 'ready', tier: TIERS.small })
    await tick()
    const retry = w1.sent.find((s) => s.msg.type === 'transcribe')!.msg as Extract<ToWorker, { type: 'transcribe' }>
    expect(retry.audio).toHaveLength(8) // the copy, because the first buffer moved to the old worker
    expect(retry.audio[0]).toBe(0.5)
    w1.reply({ type: 'result', id: retry.id, text: 'si Mimi', ms: 9 })
    await expect(result).resolves.toMatchObject({ text: 'si Mimi' })
    expect(savedTier()).toBe('small')
  })

  it('does not retry twice: a failure on the WebAssembly tier is final', async () => {
    const w0 = await loadedOnGpu()
    const result = client.transcribe(new Float32Array(4))
    await tick()
    w0.reply({ type: 'error', id: 1, message: 'GPU device lost' })
    await tick()
    const w1 = FakeWorker.all[1]
    w1.reply({ type: 'ready', tier: TIERS.small })
    await tick()
    const id = (w1.sent.find((s) => s.msg.type === 'transcribe')!.msg as { id: number }).id
    w1.reply({ type: 'error', id, message: 'out of memory' })
    await expect(result).rejects.toThrow('out of memory')
    expect(FakeWorker.all).toHaveLength(2)
  })

  it('falls back when the GPU worker crashes in the middle of a transcription', async () => {
    const w0 = await loadedOnGpu()
    const result = client.transcribe(new Float32Array(4))
    await tick()
    w0.crash('device lost')
    await tick()
    const w1 = FakeWorker.all[1]
    expect(sentTypes(w1)).toEqual(['load'])
    w1.reply({ type: 'ready', tier: TIERS.small })
    await tick()
    const id = (w1.sent.find((s) => s.msg.type === 'transcribe')!.msg as { id: number }).id
    w1.reply({ type: 'result', id, text: 'ok', ms: 1 })
    await expect(result).resolves.toMatchObject({ text: 'ok' })
  })

  it('does not blame the GPU for a network error, and does not remember it', async () => {
    const w0 = await loadedOnGpu()
    const result = client.transcribe(new Float32Array(4))
    await tick()
    w0.reply({ type: 'error', id: 1, message: 'Failed to fetch' })
    await expect(result).rejects.toThrow('Failed to fetch')
    expect(FakeWorker.all).toHaveLength(1)
    expect(savedTier()).toBeUndefined()
  })

  it('does not fall back or save the tier when the first download fails on the network', async () => {
    const p = client.loadModel()
    await tick()
    FakeWorker.all[0].reply({ type: 'error', message: 'NetworkError when attempting to fetch resource' })
    await expect(p).rejects.toThrow('NetworkError')
    expect(FakeWorker.all).toHaveLength(1)
    expect(savedTier()).toBeUndefined()
  })

  it('falls back when the warm-up fails on the GPU, then warms the new tier', async () => {
    const w0 = await loadedOnGpu()
    const warm = client.warmUp()
    await tick()
    w0.reply({ type: 'error', message: 'GPU device lost' })
    await tick()
    const w1 = FakeWorker.all[1]
    w1.reply({ type: 'ready', tier: TIERS.small })
    await tick()
    expect(sentTypes(w1)).toEqual(['load', 'warmup'])
    w1.reply({ type: 'warmed' })
    await expect(warm).resolves.toBeUndefined()
    expect(savedTier()).toBe('small')
  })

  it('shares one fallback when the worker crashes during the GPU load and a second caller arrives', async () => {
    const first = client.loadModel()
    await tick()
    FakeWorker.all[0].crash('lost the GPU while loading')
    await tick()
    const second = client.loadModel() // arrives while the fallback is loading
    await tick()
    expect(FakeWorker.all).toHaveLength(2)
    expect(sentTypes(FakeWorker.all[1])).toEqual(['load']) // one load, not two on the same worker
    FakeWorker.all[1].reply({ type: 'ready', tier: TIERS.small })
    await expect(first).resolves.toEqual(TIERS.small)
    await expect(second).resolves.toEqual(TIERS.small)
  })

  it('ignores late messages from a worker that was replaced', async () => {
    const w0 = await loadedOnGpu()
    void client.transcribe(new Float32Array(4)).catch(() => {})
    await tick()
    w0.reply({ type: 'error', id: 1, message: 'GPU device lost' })
    await tick()
    FakeWorker.all[1].reply({ type: 'ready', tier: TIERS.small })
    await tick()
    w0.reply({ type: 'ready', tier: TIERS.large }) // a ghost from the old worker
    expect(client.getActiveTier()).toEqual(TIERS.small)
  })

  it('answers the cache check for the tier it is switching to', async () => {
    const w0 = await loadedOnGpu()
    void client.transcribe(new Float32Array(4)).catch(() => {})
    await tick()
    w0.reply({ type: 'error', id: 1, message: 'GPU device lost' })
    await tick()
    const w1 = FakeWorker.all[1]
    void client.isModelCached()
    await tick()
    const ask = w1.sent.find((s) => s.msg.type === 'iscached')!.msg as Extract<ToWorker, { type: 'iscached' }>
    expect(ask.tier).toEqual(TIERS.small)
  })

  it('zeroes the failed tier\'s download progress so a bar can still reach 100%', async () => {
    const seen: { file: string; loaded: number; total: number }[] = []
    const p = client.loadModel((x) => seen.push(x))
    await tick()
    FakeWorker.all[0].reply({ type: 'progress', file: 'onnx/encoder_model_q4.onnx', loaded: 5, total: 10 })
    FakeWorker.all[0].reply({ type: 'error', message: 'GPU device lost' })
    await tick()
    expect(seen.at(-1)).toEqual({ file: 'onnx/encoder_model_q4.onnx', loaded: 0, total: 0 })
    FakeWorker.all[1].reply({ type: 'ready', tier: TIERS.small })
    await p
  })

  it('lets a person undo the saved fallback', () => {
    store['kislap.progress.v1'] = JSON.stringify({ version: 1, tier: 'small' })
    expect(client.getSavedTier()).toBe('small')
    client.forgetSavedTier()
    expect(client.getSavedTier()).toBeUndefined()
  })
})