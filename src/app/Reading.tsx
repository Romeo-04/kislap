// Reading screen: the Must loop (issue #3). Paper puppet look (Claude Design part 2): issue #10.
// mic (#2) → silence gate (ADR-0006) → Whisper in the worker (#14) → scorer (#20) → words light up → Ningning.
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { MascotMood } from '../game/mascot'
import type { ReadingState } from '../game/readingMachine'
import type { Story } from '../content/stories'
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
import { PaperScene } from '../ui/PaperScene'
import { Button } from '../ui/Button'
import { BackIcon, RetryIcon } from '../ui/icons'
import { syllabify } from '../content/syllables'
import { go } from './router'
import { haptic } from '../ui/haptics'
import './screens.css'
import './core.css'

const REVEAL_MS = 120

/** Dev/demo only: `?fake=1` makes the stub model "hear" the sentence minus its last word. Never the default. */
const FAKE = typeof location !== 'undefined' && new URLSearchParams(location.search).has('fake')

const moodCopy = {
  idle: 'mascot.idle', listening: 'reading.listening', thinking: 'reading.thinking',
  cheering: 'mascot.cheer', encouraging: 'mascot.encourage', celebrating: 'result.title',
} as const

export function Reading({ storyId }: { storyId: string }) {
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
    if (state.phase !== 'listening' && state.phase !== 'ready' && state.phase !== 'reviewed') return
    haptic(12) // a light tap, like a native record button
    if (state.phase === 'listening') return finish()
    try {
      await recorder.start()
      setMood(moodFor('mic-on'))
      dispatch({ type: 'mic-started' })
    } catch (err) {
      console.error('[reading] mic start failed', err)
      dispatch({ type: 'mic-failed', denied: err instanceof MicError && err.kind === 'denied' })
    }
  }

  if (!story || !sentence) return <NotFound />

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

  return (
    <ReadingView
      story={story}
      index={index}
      state={state}
      words={words}
      mood={mood}
      beat={beat}
      glow={glow}
      level={level}
      onMic={onMic}
      onNext={onNext}
    />
  )
}

export function NotFound() {
  const { t } = useI18n()
  return (
    <section className="rd-missing paper-stage">
      <PaperScene hills="mid" />
      <p className="rd-bubble">{t('reading.notFound')}</p>
      <a className="k-btn k-btn--primary" href="#/map">{t('result.more')}</a>
    </section>
  )
}

interface ViewProps {
  story: Story
  index: number
  state: ReadingState
  words: WordResult[]
  mood: MascotMood
  beat: number
  glow?: number
  level: number
  onMic: () => void
  onNext: () => void
}

/** What the child sees; Reading above owns the mic, the model and the session. */
export function ReadingView({ story, index, state, words, mood, beat, glow, level, onMic, onNext }: ViewProps) {
  const { t } = useI18n()
  // a syllable bubble belongs to one scoring: new words (a retry, the next sentence) close it
  const [open, setOpen] = useState<{ words: WordResult[]; i: number }>()
  const isOpen = (i: number) => open?.words === words && open.i === i
  // the mic and the Retry/Next pair swap places; when the button under focus goes away, focus
  // lands on Next after scoring and on the mic otherwise, so keyboard and switch users keep their place
  const controls = useRef<HTMLDivElement>(null)
  const last = useRef({ phase: state.phase, index })
  useEffect(() => {
    // only a swap moves focus: opening the screen (and StrictMode's second run) leaves it, so a screen reader starts at the top
    if (last.current.phase === state.phase && last.current.index === index) return
    last.current = { phase: state.phase, index }
    const box = controls.current
    const active = document.activeElement
    if (!box || (active && active !== document.body && !box.contains(active))) return
    const buttons = box.querySelectorAll('button')
    const target = state.phase === 'reviewed' ? buttons[buttons.length - 1] : buttons[0]
    if (target && target !== active) target.focus()
  }, [state.phase, index])
  const sentence = story.sentences[index]
  const total = story.sentences.length
  const micState = state.phase === 'listening' ? 'recording' : state.phase === 'thinking' ? 'thinking' : 'idle'
  const busy = state.phase === 'thinking' || state.phase === 'revealing'
  const marked = words.length > 0 && (state.phase === 'revealing' || state.phase === 'reviewed')
  const say = state.notice ?? (state.phase === 'reviewed' && mood === 'idle' ? 'reading.reviewed' : moodCopy[mood])

  return (
    <section className="rd-screen paper-stage">
      <PaperScene hills="low" />
      <header className="rd-top">
        <a className="k-icon-btn" href="#/map" aria-label={t('nav.back')}>
          <BackIcon />
        </a>
        <ol className="rd-vine" aria-label={`${index + 1}/${total}`}>
          {story.sentences.map((_, i) => (
            <li
              key={i}
              className={i < index ? 'rd-dot rd-dot--done' : i === index ? 'rd-dot rd-dot--now' : 'rd-dot'}
              aria-current={i === index ? 'step' : undefined}
            />
          ))}
        </ol>
        <span className="rd-count">{index + 1}/{total}</span>
      </header>
      <div className="rd-stage">
        <Ningning key={beat} mood={mood} glow={glow} size={180} label={t(moodCopy[mood])} />
        {/* the live region stays mounted for the whole story, so screen readers hear each new line; only the bubble re-pops */}
        <div className="rd-say" aria-live="polite" role={state.notice ? 'status' : undefined}>
          <p className="rd-bubble" key={say}>
            {t(say)}
          </p>
        </div>
      </div>
      <div className="rd-card">
        <p className="rd-sentence" lang="fil">
          {marked
            ? words.map((w, i) => {
                const reviewed = state.phase === 'reviewed'
                return (
                  <WordChip
                    key={i}
                    word={w.word}
                    status={i < state.shown || reviewed ? w.status : 'pending'}
                    popping={i === state.shown - 1}
                    syllables={syllabify(w.word)}
                    open={reviewed && isOpen(i)}
                    onTap={reviewed ? () => setOpen(isOpen(i) ? undefined : { words, i }) : undefined}
                  />
                )
              })
            : sentence.text}
        </p>
      </div>
      <div className="rd-controls" ref={controls}>
        {state.phase === 'reviewed' ? (
          <div className="rd-after">
            <Button variant="secondary" icon={<RetryIcon />} onClick={onMic}>
              {t('reading.retry')}
            </Button>
            <Button onClick={onNext}>{t('reading.next')}</Button>
          </div>
        ) : (
          <div className="rd-mic">
            <MicButton
              state={micState}
              level={state.phase === 'listening' ? level : 0}
              label={t(state.phase === 'listening' ? 'reading.stop' : 'reading.tapMic')}
              onPress={busy ? undefined : onMic}
            />
            <p className="rd-status">{t(state.phase === 'listening' ? 'reading.stop' : 'reading.tapMic')}</p>
            {state.canSkip && state.phase === 'ready' && (
              <Button variant="secondary" className="rd-skip" onClick={onNext}>
                {t('reading.skip')}
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="rd-privacy">
        <PrivacyMeter />
      </div>
    </section>
  )
}
