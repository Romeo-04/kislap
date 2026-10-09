// Model debug page (/#/asrtest): load the model, record, transcribe, show text + ms. Used for #14, #15.
// Add ?tier=large or ?tier=small to force a tier.
import { useRef, useState } from 'react'
import { forgetSavedTier, getActiveTier, getSavedTier, isModelCached, loadModel, transcribe, warmUp } from '../asr/transcribe'
import { rms, SILENCE_RMS } from '../asr/meter'
import type { TierInfo } from '../asr/tier'

const RATE = 16_000

/** Decode a recorded blob to 16 kHz mono Float32 (the contract format). */
async function toPcm(blob: Blob): Promise<Float32Array> {
  const ctx = new AudioContext()
  const decoded = await ctx.decodeAudioData(await blob.arrayBuffer())
  await ctx.close()
  const frames = Math.ceil(decoded.duration * RATE)
  const offline = new OfflineAudioContext(1, frames, RATE) // mixes down to mono and resamples
  const src = offline.createBufferSource()
  src.buffer = decoded
  src.connect(offline.destination)
  src.start()
  return (await offline.startRendering()).getChannelData(0)
}

export function AsrTest() {
  const [tier, setTier] = useState<TierInfo>()
  const [status, setStatus] = useState('model not loaded')
  const [cached, setCached] = useState<boolean>()
  const [text, setText] = useState('')
  const [ms, setMs] = useState<number>()
  const [clip, setClip] = useState('')
  const [, refresh] = useState(0) // re-read the saved tier after the button below
  const chunks = useRef<Blob[]>([])

  const load = async () => {
    const t0 = performance.now()
    try {
      setStatus('loading…')
      const info = await loadModel((p) => setStatus(`downloading ${p.file}: ${(p.loaded / 1e6).toFixed(1)} / ${(p.total / 1e6).toFixed(1)} MB`))
      setTier(info)
      setStatus('warming up…')
      await warmUp()
      setStatus(`ready in ${((performance.now() - t0) / 1000).toFixed(1)} s`)
      setCached(await isModelCached())
    } catch (err) {
      setStatus(`load error: ${(err as Error).message}`)
    }
  }

  const record = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunks.current = []
      rec.ondataavailable = (e) => chunks.current.push(e.data)
      rec.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop())
        try {
          setStatus('transcribing…')
          const pcm = await toPcm(new Blob(chunks.current, { type: rec.mimeType }))
          // Read the clip stats first: transcribe() transfers the buffer away.
          setClip(`${(pcm.length / RATE).toFixed(1)} s · loudness ${rms(pcm).toFixed(4)} (silence < ${SILENCE_RMS})`)
          const out = await transcribe(pcm)
          setText(out.text)
          setMs(out.ms)
          setStatus('done')
        } catch (err) {
          setStatus(`transcribe error: ${(err as Error).message}`)
        }
      }
      rec.start()
      setStatus('recording 5 s… read a sentence')
      setTimeout(() => rec.stop(), 5000)
    } catch (err) {
      setStatus(`mic error: ${(err as Error).message}`)
    }
  }

  return (
    <section className="stack">
      <h1>Model check</h1>
      <p>
        Tier: {tier ? `${tier.tier} · ${tier.modelId} · ${tier.device}` : '—'} · cached: {String(cached ?? '?')}
      </p>
      <p>
        Saved tier: {getSavedTier() ?? 'none'} · active now: {getActiveTier()?.tier ?? 'not loaded'}
        {getSavedTier() && (
          <>
            {' '}
            <button onClick={() => { forgetSavedTier(); refresh((n) => n + 1) }}>Forget saved tier</button>
          </>
        )}
      </p>
      <button className="big" onClick={load}>Load model</button>
      <button className="big" onClick={record} disabled={!tier}>🎤 Record 5 s</button>
      <p>{status}</p>
      {clip && <p>Clip: {clip}</p>}
      {ms !== undefined && (
        <p>
          Heard text: <strong>{text || '(nothing)'}</strong> · {ms} ms
        </p>
      )}
      <a href="#/">Back</a>
    </section>
  )
}
