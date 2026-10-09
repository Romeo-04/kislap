// Device check page (/#/mictest): secure context, WebGPU, and the real recorder (#2).
// Plays back the exact 16 kHz clip Whisper will receive. Used for #1, #15, #48.
import { useEffect, useMemo, useState } from 'react'
import { createRecorder, MicError, SAMPLE_RATE, SPEECH_LEVEL } from '../asr/audio'
import { isMostlySilence, rms } from '../asr/meter'
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

function play(pcm: Float32Array) {
  const ctx = new AudioContext()
  const buf = ctx.createBuffer(1, pcm.length, SAMPLE_RATE)
  buf.copyToChannel(pcm as Float32Array<ArrayBuffer>, 0)
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.connect(ctx.destination)
  src.onended = () => ctx.close()
  src.start()
}

export function MicTest() {
  const { t } = useI18n()
  const recorder = useMemo(() => createRecorder(), [])
  const [gpu, setGpu] = useState<GpuInfo | null>(null)
  const [recording, setRecording] = useState(false)
  const [level, setLevel] = useState(0)
  const [status, setStatus] = useState('idle')
  const [clip, setClip] = useState<Float32Array>()

  const stop = async () => {
    const pcm = await recorder.stop()
    setRecording(false)
    setClip(pcm)
    setStatus(
      `${(pcm.length / SAMPLE_RATE).toFixed(2)} s at 16 kHz · RMS ${rms(pcm).toFixed(4)} · ` +
        (isMostlySilence(pcm) ? 'SILENCE (would not be sent to Whisper)' : 'speech (would be sent to Whisper)'),
    )
  }

  useEffect(() => {
    probeGpu().then(setGpu)
    const offLevel = recorder.onLevel(setLevel)
    const offAuto = recorder.onAutoStop(() => void stop())
    return () => {
      offLevel()
      offAuto()
      recorder.release()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder])

  const toggle = async () => {
    if (recording) return stop()
    try {
      setClip(undefined)
      await recorder.start()
      setRecording(true)
      setStatus('recording… stops after 1.5 s of silence')
    } catch (err) {
      setStatus(err instanceof MicError ? `mic ${err.kind}: ${err.message}` : String(err))
    }
  }

  return (
    <section className="stack">
      <h1>{t('device.title')}</h1>
      <ul>
        <li>{t('device.secure')}: {t(window.isSecureContext ? 'device.yes' : 'device.no')}</li>
        <li>{t('device.micAvailable')}: {t(typeof navigator.mediaDevices?.getUserMedia === 'function' ? 'device.yes' : 'device.no')}</li>
        <li>
          WebGPU: {t(gpu ? (gpu.available ? 'device.yes' : 'device.no') : 'device.checking')}
          {gpu?.available && ` · shader-f16: ${t(gpu.f16 ? 'device.yes' : 'device.no')} · ${gpu.vendor || t('device.unknownGpu')}`}
        </li>
        <li>{t('device.cores')}: {navigator.hardwareConcurrency} · {t('device.browser')}: {navigator.userAgent}</li>
      </ul>
      <button className="big" onClick={toggle}>{recording ? '⏹ Stop' : '🎤 Record'}</button>
      <meter min={0} max={0.2} low={SPEECH_LEVEL} value={recording ? level : 0} style={{ width: '100%', height: 24 }} />
      <p>{status}</p>
      {clip && <button onClick={() => play(clip)}>▶ Play the 16 kHz clip</button>}
      <a href="#/">{t('nav.back')}</a>
    </section>
  )
}
