// Device benchmark page (/#/bench) for issue #15. Records one clip, then runs each model setup
// in its own worker and times it. Copy the table into PROGRESS.md.
// Load time includes the download on the first run. Run twice to see cached load time.
import { useEffect, useRef, useState } from 'react'
import { checkedByDefault, closeAllSessions, openSession, RATE, SETUPS, toPcm, type Session, type Setup } from '../asr/devkit'

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

/** Load one setup in a fresh worker, then time the first and the second inference. */
async function runSetup(setup: Setup, pcm: Float32Array, onProgress: (s: string) => void): Promise<Row> {
  const row: Row = { label: setup.label }
  let session: Session | undefined
  try {
    const t0 = performance.now()
    session = await openSession(setup, onProgress)
    row.loadS = (performance.now() - t0) / 1000
    const t1 = performance.now()
    await session.transcribe(pcm)
    row.firstMs = Math.round(performance.now() - t1)
    const t2 = performance.now()
    const out = await session.transcribe(pcm)
    row.sentenceMs = Math.round(performance.now() - t2)
    row.text = out.text
  } catch (err) {
    row.error = err instanceof Error ? err.message : String(err)
  } finally {
    session?.close()
  }
  return row
}

export function Bench() {
  const [gpu, setGpu] = useState<GpuInfo>()
  const [pcm, setPcm] = useState<Float32Array>()
  const [status, setStatus] = useState('Step 1: record a 4 s sentence.')
  const [rows, setRows] = useState<Row[]>([])
  const [busy, setBusy] = useState(false)
  // Local setups need dev-only files, and known failures waste a download, so both start unchecked.
  const [picked, setPicked] = useState<boolean[]>(SETUPS.map(checkedByDefault))
  const chunks = useRef<Blob[]>([])
  const left = useRef(false)

  useEffect(() => {
    left.current = false
    probeGpu().then(setGpu)
    return () => {
      // Leaving the page: stop the run and any worker still downloading.
      left.current = true
      closeAllSessions()
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
    for (const [i, setup] of SETUPS.entries()) {
      if (!picked[i]) continue
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
      {SETUPS.map((s, i) => (
        <label key={s.label} style={{ display: 'block' }}>
          <input
            type="checkbox"
            checked={picked[i]}
            disabled={busy}
            onChange={() => setPicked((p) => p.map((v, j) => (j === i ? !v : v)))}
          />{' '}
          {s.label}
          {s.local && ' (needs the local model folder)'}
          {s.fails && ` (known to fail: ${s.fails})`}
        </label>
      ))}
      <button className="big" onClick={record} disabled={busy}>🎤 Record 4 s</button>
      <button className="big" onClick={run} disabled={!pcm || busy}>Run benchmark</button>
      <p>{status}</p>
      {rows.length > 0 && <textarea readOnly rows={8} value={table} style={{ width: '100%' }} />}
      <p>Note any crash or page reload by hand. Memory in the worker is not visible here.</p>
      <a href="#/">Back</a>
    </section>
  )
}
