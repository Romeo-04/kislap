// Device check page (/#/mictest): secure context, mic record + playback, WebGPU. Used for #1, #15, #48.
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'

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
  const { t } = useI18n()
  const [gpu, setGpu] = useState<GpuInfo | null>(null)
  const [status, setStatus] = useState<'idle' | 'recorded' | 'recording' | 'micProblem'>('idle')
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
        setStatus('recorded')
      }
      rec.start()
      setStatus('recording')
      setTimeout(() => rec.stop(), 3000)
    } catch {
      setStatus('micProblem')
    }
  }

  return (
    <section className="stack">
      <h1>{t('device.title')}</h1>
      <ul>
        <li>{t('device.secure')}: {t(window.isSecureContext ? 'device.yes' : 'device.no')}</li>
        <li>{t('device.micAvailable')}: {t(typeof navigator.mediaDevices?.getUserMedia === 'function' ? 'device.yes' : 'device.no')}</li>
        <li>
          WebGPU: {t(gpu ? gpu.available ? 'device.yes' : 'device.no' : 'device.checking')}
          {gpu?.available && ` · shader-f16: ${t(gpu.f16 ? 'device.yes' : 'device.no')} · ${gpu.vendor || t('device.unknownGpu')}`}
        </li>
        <li>{t('device.cores')}: {navigator.hardwareConcurrency} · {t('device.browser')}: {navigator.userAgent}</li>
      </ul>
      <button className="big" onClick={record}>🎤 {t('device.record')}</button>
      <p>{t(`device.${status}`)}</p>
      {audioUrl && <audio controls src={audioUrl} />}
      <a href="#/">{t('nav.back')}</a>
    </section>
  )
}
