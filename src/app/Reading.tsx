// PLACEHOLDER screen — design: issue #10 (designer); real wiring: issue #3 (lead).
// Real mic (#2) + fake model: the fake "hears" the sentence minus its last word until #14 lands.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { getStory } from '../content/stories'
import { createRecorder, MicError } from '../asr/audio'
import { isMostlySilence } from '../asr/meter'
import { setFakeHeard, transcribe } from '../asr/transcribe'
import { scoreReading, type WordResult } from '../scoring/score'
import { createSession } from '../game/session'
import { moodFor, type MascotMood } from '../game/mascot'
import { go } from './router'

const moodCopy = {
  idle: 'mascot.idle', listening: 'reading.listening', thinking: 'reading.thinking',
  cheering: 'mascot.cheer', encouraging: 'mascot.encourage', celebrating: 'result.title',
} as const

type Phase = 'ready' | 'listening' | 'thinking' | 'reviewed'

export function Reading({ storyId }: { storyId: string }) {
  const { t } = useI18n()
  const story = getStory(storyId)
  const recorder = useMemo(() => createRecorder(), [])
  const session = useMemo(() => createSession(storyId), [storyId])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('ready')
  const [words, setWords] = useState<WordResult[]>([])
  const [mood, setMood] = useState<MascotMood>('idle')
  const [notice, setNotice] = useState('')
  const finishRef = useRef<() => void>(() => {})
  const finishing = useRef(false) // auto-stop and a stop tap can land in the same frame

  useEffect(() => {
    const off = recorder.onAutoStop(() => finishRef.current())
    return () => {
      off()
      recorder.release()
    }
  }, [recorder])

  const sentence = story?.sentences[index]

  // A kind retry that never marks a word: used for silence and for any model failure.
  const retryKindly = (key: 'reading.silence' | 'reading.modelRetry') => {
    setNotice(t(key))
    setMood(moodFor('silence'))
    setPhase('ready')
  }

  const finish = async () => {
    if (!sentence || finishing.current) return
    finishing.current = true
    setPhase('thinking')
    setMood(moodFor('mic-off'))
    try {
      const pcm = await recorder.stop()
      // Silence gate (ADR-0006): never send silence to Whisper, never mark words for it.
      if (isMostlySilence(pcm)) return retryKindly('reading.silence')
      setFakeHeard(sentence.text.split(' ').slice(0, -1).join(' '))
      const { text } = await transcribe(pcm)
      const scored = scoreReading(sentence.text, text)
      session.attempts.push({ sentenceIndex: index, heard: text, ...scored })
      setWords(scored.words)
      setMood(moodFor('scored', scored.accuracy))
      setPhase('reviewed')
    } catch (err) {
      console.error('[reading] transcription failed', err)
      retryKindly('reading.modelRetry') // a model error never costs the child
    } finally {
      finishing.current = false
    }
  }

  const onMic = async () => {
    if (phase === 'listening') return finish()
    try {
      setNotice('')
      await recorder.start()
      setWords([])
      setMood(moodFor('mic-on'))
      setPhase('listening')
    } catch (err) {
      console.error('[reading] mic start failed', err)
      setNotice(t(err instanceof MicError && err.kind === 'denied' ? 'mic.denied' : 'mic.unavailable'))
    }
  }

  // Auto-stop calls the latest finish() (it closes over the current sentence).
  useEffect(() => {
    finishRef.current = () => void finish()
  })

  if (!story || !sentence) return <p>{t('reading.notFound')}</p>

  const onNext = () => {
    if (index + 1 < story.sentences.length) {
      setIndex(index + 1)
      setWords([])
      setPhase('ready')
      setMood('idle')
    } else {
      sessionStorage.setItem(`kislap.result.${storyId}`, String(session.accuracy()))
      go(`result/${storyId}`)
    }
  }

  return (
    <section className="stack">
      <p className="muted">
        {index + 1} / {story.sentences.length} · {t(moodCopy[mood])}
      </p>
      <p className="sentence">
        {words.length
          ? words.map((w, i) => <span key={i} className={`word ${w.status}`}>{w.word} </span>)
          : sentence.text}
      </p>
      <button className="big mic" onClick={onMic} disabled={phase === 'thinking'} aria-label={t(phase === 'listening' ? 'reading.stop' : 'reading.tapMic')}>
        {phase === 'listening' ? '⏹' : '🎤'}
      </button>
      <p className="muted">
        {phase === 'listening' ? t('reading.listening') : phase === 'thinking' ? t('reading.thinking') : t('reading.tapMic')}
      </p>
      {notice && <p role="status">{notice}</p>}
      {phase === 'reviewed' && (
        <div className="row">
          <button onClick={onMic}>{t('reading.retry')}</button>
          <button className="big" onClick={onNext}>{t('reading.next')}</button>
        </div>
      )}
    </section>
  )
}
