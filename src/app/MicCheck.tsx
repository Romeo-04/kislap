import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { createRecorder, MicError } from '../asr/audio'
import { isMostlySilence } from '../asr/meter'
import { Ningning } from '../ui/Ningning'
import { MicButton } from '../ui/MicButton'

export function MicCheck() {
  const { t } = useI18n()
  const recorder = useMemo(() => createRecorder({ maxMs: 5000 }), [])
  const [phase, setPhase] = useState<'idle' | 'starting' | 'recording' | 'heard' | 'quiet' | 'denied' | 'unavailable'>('idle')
  const [level, setLevel] = useState(0)
  const recording = useRef(false)
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    const finish = async () => {
      if (!recording.current) return
      recording.current = false
      const pcm = await recorder.stop()
      recorder.release()
      if (mounted.current) { setLevel(0); setPhase(isMostlySilence(pcm) ? 'quiet' : 'heard') }
    }
    const offLevel = recorder.onLevel(value => setLevel(Math.min(1, value * 8)))
    const offStop = recorder.onAutoStop(() => void finish())
    return () => { mounted.current = false; recording.current = false; offLevel(); offStop(); recorder.release() }
  }, [recorder])
  const onMic = async () => {
    if (phase === 'starting') return
    if (recording.current) {
      recording.current = false
      const pcm = await recorder.stop()
      recorder.release()
      if (mounted.current) { setLevel(0); setPhase(isMostlySilence(pcm) ? 'quiet' : 'heard') }
      return
    }
    setPhase('starting')
    try {
      await recorder.start()
      if (mounted.current) { recording.current = true; setPhase('recording') }
    } catch (error) {
      if (mounted.current) setPhase(error instanceof MicError && error.kind === 'denied' ? 'denied' : 'unavailable')
    }
  }
  return (
    <section className="stack center">
      <h1>{t('miccheck.title')}</h1>
      <Ningning mood={phase === 'recording' ? 'listening' : phase === 'heard' ? 'cheering' : 'idle'} size={160} />
      <p>{t('miccheck.say')}</p>
      <h2>“{t('miccheck.phrase')}”</h2>
      <MicButton state={phase === 'recording' ? 'recording' : phase === 'starting' ? 'thinking' : 'idle'} level={level} label={t(phase === 'recording' ? 'reading.stop' : 'miccheck.title')} onPress={() => void onMic()} />
      <progress className="mic-level" max={1} value={level} aria-label={t('mic.label')} />
      <p role="status">{t(phase === 'heard' ? 'miccheck.clear' : phase === 'quiet' ? 'reading.silence' : phase === 'denied' ? 'mic.denied' : phase === 'unavailable' ? 'mic.unavailable' : phase === 'recording' ? 'reading.listening' : 'reading.tapMic')}</p>
      {phase === 'denied' && <ol><li>{t('mic.step1')}</li><li>{t('mic.step2')}</li><li>{t('mic.step3')}</li></ol>}
      <a className="candy-button" href="#/map">{t('miccheck.done')}</a>
    </section>
  )
}
