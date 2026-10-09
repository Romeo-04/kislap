// Reading screen: the Must loop (issue #3). Visual design: issue #10 (designer).
// mic (#2) → silence gate (ADR-0006) → Whisper in the worker (#14) → scorer (#20) → words light up → Ningning.
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { getStory } from '../content/stories'
import { createRecorder, MicError } from '../asr/audio'
import { isMostlySilence } from '../asr/meter'
import { isModelCached, loadModel, setFakeHeard, transcribe } from '../asr/transcribe'
import { scoreReading, type WordResult } from '../scoring/score'
import { createSession, finishSession } from '../game/session'
import { initialReading, readingReducer } from '../game/readingMachine'
import { glowFor, moodFor } from '../game/mascot'
import { loadSettings } from '../game/settings'
import { playSound } from '../game/sound'
import { useMascotMood } from '../ui/useMascotMood'
import { Ningning } from '../ui/Ningning'
import { WordChip } from '../ui/WordChip'
import { MicButton } from '../ui/MicButton'
import { PrivacyMeter } from '../ui/PrivacyMeter'
import { go } from './router'
import { haptic } from '../ui/haptics'

const REVEAL_MS = 120

/** Dev/demo only: `?fake=1` makes the stub model "hear" the sentence minus its last word. Never the default. */
const FAKE = typeof location !== 'undefined' && new URLSearchParams(location.search).has('fake')

const moodCopy = {
  idle: 'mascot.idle', listening: 'reading.listening', thinking: 'reading.thinking',
  cheering: 'mascot.cheer', encouraging: 'mascot.encourage', celebrating: 'result.title',
} as const

export function Reading({ storyId }: { storyId: string }) {
  const { t } = useI18n()
  const story = getStory(storyId)
  const recorder = useMemo(() => createRecorder(), [])
  const session = useMemo(() => createSession(storyId, story?.sentences.length ?? 0), [storyId, story])
  const [index, setIndex] = useState(0)
  const [state, dispatch] = useReducer(readingReducer, initialReading)
  const [words, setWords] = useState<WordResult[]>([])
  const [glow, setGlow] = useState<number>()
  const [level, setLevel] = useState(0)
  const [mood, setMood, beat] = useMascotMood('idle')
  const finishRef = useRef<() => void>(() => {})
  const skipped = useRef(false)
  const finishing = useRef(false) // auto-stop and a tap can both fire before React re-renders
  const sentence = story?.sentences[index]

  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // Load the cached model as soon as a story opens. Never download from here (Home does that,
  // with progress): with no cached model the child sees a kind notice and may skip the Sentence.
  useEffect(() => {
    if (FAKE) return
    isModelCached()
      .then((cached) => (cached ? loadModel().then(() => undefined) : Promise.reject(new Error('model not cached'))))
      .catch((err) => {
        console.error('[reading] model not ready', err)
        if (mounted.current) dispatch({ type: 'model-unavailable' })
      })
  }, [])

  useEffect(() => {
    const offStop = recorder.onAutoStop(() => finishRef.current())
    const offLevel = recorder.onLevel((rms) => setLevel(Math.min(1, rms * 8)))
    return () => {
      offStop()
      offLevel()
      recorder.release() // the mic light goes off when the child leaves
    }
  }, [recorder])

  // Words light up one by one.
  useEffect(() => {
    if (state.phase !== 'revealing') return
    const timer = setTimeout(() => dispatch({ type: 'reveal-tick' }), REVEAL_MS)
    return () => clearTimeout(timer)
  }, [state])

  const finish = async () => {
    if (!sentence || state.phase !== 'listening' || finishing.current) return
    finishing.current = true
    dispatch({ type: 'stopped' })
    setMood(moodFor('mic-off'))
    try {
      const pcm = await recorder.stop()
      if (isMostlySilence(pcm)) {
        setMood(moodFor('silence'))
        return dispatch({ type: 'silence' })
      }
      if (FAKE) setFakeHeard(sentence.text.split(' ').slice(0, -1).join(' '))
      const { text } = await transcribe(pcm)
      if (!mounted.current) return // the child left while Ningning was thinking
      // Noise can pass the silence gate and come back empty: that is a model miss, not the child's.
      if (!text.trim()) {
        setMood(moodFor('silence'))
        return dispatch({ type: 'failed' })
      }
      const scored = scoreReading(sentence.text, text)
      session.addAttempt({ sentenceIndex: index, heard: text, ...scored })
      setWords(scored.words)
      setGlow(glowFor(scored.accuracy))
      setMood(moodFor('scored', scored.accuracy))
      playSound('reveal', loadSettings())
      dispatch({ type: 'scored', words: scored.words.length })
    } catch (err) {
      console.error('[reading] transcription failed', err)
      setMood(moodFor('silence'))
      dispatch({ type: 'failed' }) // a model error never costs the child
    } finally {
      finishing.current = false
    }
  }

  useEffect(() => {
    finishRef.current = () => void finish()
  })

  const onMic = async () => {
    haptic(12) // a light tap, like a native record button
    if (state.phase === 'listening') return finish()
    if (state.phase !== 'ready' && state.phase !== 'reviewed') return
    try {
      await recorder.start()
      setMood(moodFor('mic-on'))
      dispatch({ type: 'mic-started' })
    } catch (err) {
      console.error('[reading] mic start failed', err)
      dispatch({ type: 'mic-failed', denied: err instanceof MicError && err.kind === 'denied' })
    }
  }

  if (!story || !sentence) {
    return (
      <section className="stack center">
        <p>{t('reading.notFound')}</p>
        <a className="big" href="#/map">{t('result.more')}</a>
      </section>
    )
  }

  const onNext = () => {
    if (state.phase !== 'reviewed') skipped.current = true // skipping only exists when the model cannot run
    if (index + 1 < story.sentences.length) {
      dispatch({ type: 'next' })
      setIndex(index + 1)
      setWords([])
      setGlow(undefined)
      setMood('idle')
    } else {
      try {
        finishSession(session, { allowPartial: skipped.current })
        go(`result/${storyId}`)
      } catch (err) {
        console.error('[reading] session incomplete', err) // never strand the child on the last Sentence
        go('map')
      }
    }
  }

  const micState = state.phase === 'listening' ? 'recording' : state.phase === 'thinking' ? 'thinking' : 'idle'
  const busy = state.phase === 'thinking' || state.phase === 'revealing'

  return (
    <section className="stack center">
      <p className="muted">{index + 1} / {story.sentences.length}</p>
      <Ningning key={beat} mood={mood} glow={glow} size={140} label={t(moodCopy[mood])} />
      <p aria-live="polite">{t(moodCopy[mood])}</p>
      <p className="sentence" lang="fil">
        {words.length && (state.phase === 'revealing' || state.phase === 'reviewed')
          ? words.map((w, i) => <WordChip key={i} word={w.word} status={i < state.shown || state.phase === 'reviewed' ? w.status : 'pending'} popping={i === state.shown - 1} />)
          : sentence.text}
      </p>
      <MicButton
        state={micState}
        level={state.phase === 'listening' ? level : 0}
        label={t(state.phase === 'listening' ? 'reading.stop' : 'reading.tapMic')}
        onPress={busy ? undefined : onMic}
      />
      {state.notice && <p role="status">{t(state.notice)}</p>}
      {state.phase === 'reviewed' && (
        <div className="row">
          <button onClick={onMic}>{t('reading.retry')}</button>
          <button className="big" onClick={onNext}>{t('reading.next')}</button>
        </div>
      )}
      {state.canSkip && state.phase === 'ready' && (
        <div className="row">
          <a href="#/">{t('nav.back')}</a>
          <button onClick={onNext}>{t('reading.skip')}</button>
        </div>
      )}
      <PrivacyMeter />
    </section>
  )
}
