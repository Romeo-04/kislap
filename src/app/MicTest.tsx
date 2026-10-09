// Device check page (/#/mictest): secure context, mic record + playback, WebGPU. Used for #1, #15, #48.
import { useEffect, useRef, useState } from 'react'

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

export function MicTest() {
  const [gpu, setGpu] = useState<GpuInfo | null>(null)
  const [status, setStatus] = useState('idle')
  const [audioUrl, setAudioUrl] = useState<string>()
  const chunks = useRef<Blob[]>([])

  useEffect(() => {
    probeGpu().then(setGpu)
  }, [])

  const record = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunks.current = []
      rec.ondataavailable = (e) => chunks.current.push(e.data)
      rec.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop())
        setAudioUrl(URL.createObjectURL(new Blob(chunks.current, { type: rec.mimeType })))
        setStatus('recorded — press play')
      }
      rec.start()
      setStatus('recording 3 s…')
      setTimeout(() => rec.stop(), 3000)
    } catch (err) {
      setStatus(`mic error: ${(err as Error).message}`)
    }
  }

  return (
    <section className="stack">
      <h1>Device check</h1>
      <ul>
        <li>Secure context (HTTPS): {String(window.isSecureContext)}</li>
        <li>getUserMedia: {String(!!navigator.mediaDevices?.getUserMedia)}</li>
        <li>
          WebGPU: {gpu ? String(gpu.available) : '…'}
          {gpu?.available && ` · shader-f16: ${gpu.f16} · ${gpu.vendor || 'unknown GPU'}`}
        </li>
        <li>Cores: {navigator.hardwareConcurrency} · UA: {navigator.userAgent}</li>
      </ul>
      <button className="big" onClick={record}>🎤 Record 3 s</button>
      <p>{status}</p>
      {audioUrl && <audio controls src={audioUrl} />}
      <a href="#/">Back</a>
    </section>
  )
}
