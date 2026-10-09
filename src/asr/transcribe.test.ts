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