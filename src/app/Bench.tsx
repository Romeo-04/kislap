// Device benchmark page (/#/bench) for issue #15. Records one clip, then runs each model setup
// in its own worker and times it. Copy the table into PROGRESS.md.
// Load time includes the download on the first run. Run twice to see cached load time.
import { useEffect, useRef, useState } from 'react'
import type { DataType } from '@huggingface/transformers'
import type { FromWorker, ToWorker } from '../asr/messages'
import { TIERS, type TierInfo } from '../asr/tier'

const RATE = 16_000

interface Setup {
  label: string
  tier: TierInfo
  dtype: DataType | Record<string, DataType>
}

// Not listed on purpose: internetoftim/whisper-small-pld-fil-ONNX. It downloads 586 MB and then
// fails at inference ("Missing the following inputs: cache_position"). See PROGRESS.md.
const SETUPS: Setup[] = [
  { label: 'base q8 (WASM)', tier: { ...TIERS.small, device: 'wasm' }, dtype: 'q8' },
  { label: 'base q4 (WebGPU)', tier: { ...TIERS.small, device: 'webgpu' }, dtype: 'q4' },
]

// Workers that are running now, so leaving the page can stop them (a download would carry on otherwise).
const active = new Set<Worker>()

interface Row {
  label: string
  loadS?: number
  firstMs?: number
  sentenceMs?: number
  text?: string
  error?: string
}

interface GpuInfo {
  available: boolean
  f16?: boolean
  vendor?: string
}

async function probeGpu(): Promise<GpuInfo> {
  type Adapter = { features: Set<string>; info?: { vendor?: string; architecture?: string } }
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<Adapter | null> } }).gpu
  if (!gpu) return { available: false }
  try {
    const adapter = await gpu.requestAdapter()
    if (!adapter) return { available: false }
    return {
      available: true,
      f16: adapter.features.has('shader-f16'),
      vendor: [adapter.info?.vendor, adapter.info?.architecture].filter(Boolean).join(' '),
    }
  } catch {
    return { available: false }
  }
}

/** Decode a recorded blob to 16 kHz mono Float32 (the contract format). */
async function toPcm(blob: Blob): Promise<Float32Array> {
  const ctx = new AudioContext()
  const decoded = await ctx.decodeAudioData(await blob.arrayBuffer())
  await ctx.close()
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * RATE), RATE)
  const src = offline.createBufferSource()
  src.buffer = decoded
  src.connect(offline.destination)
  src.start()
  return (await offline.startRendering()).getChannelData(0)
}

/** Ask one fresh worker to load a setup, then time the first and the second inference. */
function runSetup(setup: Setup, pcm: Float32Array, onProgress: (s: string) => void): Promise<Row> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('../asr/worker.ts', import.meta.url), { type: 'module' })
    active.add(worker)
    const row: Row = { label: setup.label }
    const t0 = performance.now()
    let tInfer = 0
    let step: 'load' | 'first' | 'second' = 'load'
    const post = (msg: ToWorker) => worker.postMessage(msg)
    const send = (id: number) => {
      tInfer = performance.now()
      post({ type: 'transcribe', id, audio: pcm.slice() }) // copy: the clip is reused
    }
    const done = () => {
      worker.terminate()
      active.delete(worker)
      resolve(row)
    }
    worker.onerror = (e) => {
      row.error = e.message || 'worker crashed'
      done()
    }
    worker.onmessageerror = () => {
      row.error = 'worker sent an unreadable message'
      done()
    }
    worker.onmessage = (e: MessageEvent<FromWorker>) => {
      const m = e.data
      if (m.type === 'progress') onProgress(`${setup.label}: ${m.file} ${(m.loaded / 1e6).toFixed(0)}/${(m.total / 1e6).toFixed(0)} MB`)
      else if (m.type === 'error') {
        row.error = m.message
        done()
      } else if (m.type === 'ready') {
        row.loadS = (performance.now() - t0) / 1000
        step = 'first'
        send(1)
      } else if (m.type === 'result' && step === 'first') {
        row.firstMs = Math.round(performance.now() - tInfer)
        step = 'second'
        send(2)
      } else if (m.type === 'result' && step === 'second') {
        row.sentenceMs = Math.round(performance.now() - tInfer)
        row.text = m.text
        done()
      }
    }
    post({ type: 'load', tier: setup.tier, dtype: setup.dtype })
  })
}

export function Bench() {
  const [gpu, setGpu] = useState<GpuInfo>()
  const [pcm, setPcm] = useState<Float32Array>()
  const [status, setStatus] = useState('Step 1: record a 4 s sentence.')
  const [rows, setRows] = useState<Row[]>([])
  const [busy, setBusy] = useState(false)
  const chunks = useRef<Blob[]>([])

  const left = useRef(false)

  useEffect(() => {
    left.current = false
    probeGpu().then(setGpu)
    return () => {
      // Leaving the page: stop the run and any worker still downloading.
      left.current = true
      active.forEach((w) => w.terminate())
      active.clear()
    }
  }, [])

  const record = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunks.current = []
      rec.ondataavailable = (e) => chunks.current.push(e.data)
      rec.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop())
        try {
          const clip = await toPcm(new Blob(chunks.current, { type: rec.mimeType }))
          setPcm(clip)
          setStatus(`Clip ready (${(clip.length / RATE).toFixed(1)} s). Step 2: run the benchmark.`)
        } catch (err) {
          setStatus(`Could not read the recording: ${(err as Error).message}. Record again.`)
        }
      }
      rec.start()
      setStatus('Recording 4 s… read a sentence')
      setTimeout(() => rec.stop(), 4000)
    } catch (err) {
      setStatus(`mic error: ${(err as Error).message}`)
    }
  }

  const run = async () => {
    if (!pcm) return
    setBusy(true)
    setRows([])
    for (const setup of SETUPS) {
      if (setup.tier.device === 'webgpu' && !gpu?.available) {
        setRows((r) => [...r, { label: setup.label, error: 'no WebGPU on this device' }])
        continue
      }
      setStatus(`Running ${setup.label}…`)
      const row = await runSetup(setup, pcm, setStatus)
      if (left.current) return // the page was closed during the run
      setRows((r) => [...r, row])
    }
    setStatus('Done. Copy the table below into PROGRESS.md.')
    setBusy(false)
  }

  const mem = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
  const deviceMem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  const table = [
    '| Setup | Load s | First inference ms | 4 s sentence ms | Notes |',
    '|---|---|---|---|---|',
    ...rows.map(
      (r) =>
        `| ${r.label} | ${r.loadS?.toFixed(1) ?? '–'} | ${r.firstMs ?? '–'} | ${r.sentenceMs ?? '–'} | ${r.error ? `ERROR: ${r.error}` : `heard: ${r.text}`} |`,
    ),
  ].join('\n')

  return (
    <section className="stack">
      <h1>Device benchmark</h1>
      <ul>
        <li>
          WebGPU: {gpu ? String(gpu.available) : '…'}
          {gpu?.available && ` · shader-f16: ${gpu.f16} · ${gpu.vendor || 'unknown GPU'}`}
        </li>
        <li>Cores: {navigator.hardwareConcurrency} · RAM hint: {deviceMem ?? '?'} GB</li>
        <li>JS heap now: {mem ? `${(mem.usedJSHeapSize / 1e6).toFixed(0)} MB` : 'not available'} (main thread only)</li>
        <li>UA: {navigator.userAgent}</li>
      </ul>
      <button className="big" onClick={record} disabled={busy}>🎤 Record 4 s</button>
      <button className="big" onClick={run} disabled={!pcm || busy}>Run benchmark</button>
      <p>{status}</p>
      {rows.length > 0 && <textarea readOnly rows={8} value={table} style={{ width: '100%' }} />}
      <p>Note any crash or page reload by hand. Memory in the worker is not visible here.</p>
      <a href="#/">Back</a>
    </section>
  )
}
