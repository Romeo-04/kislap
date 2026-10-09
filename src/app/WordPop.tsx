// Word Pop (issue #13, spec §9): Practice words float as paper bubbles; the child says one to pop it.
// mic (#2) → silence gate (ADR-0006) → Whisper in the worker (#14) → matchesWord → pop. Rules: game/wordPop.ts.
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { MascotMood } from '../game/mascot'
import { useI18n, type MessageKey } from '../i18n'
import { loadProgress } from '../game/progress'
import { createRecorder, MicError } from '../asr/audio'
import { isMostlySilence } from '../asr/meter'
import { isModelCached, loadModel, setFakeHeard, transcribe } from '../asr/transcribe'
import { initialWordPop, isDone, wordPopReducer, type WordPopState } from '../game/wordPop'
import { moodFor } from '../game/mascot'
import { loadSettings } from '../game/settings'
import { playSound } from '../game/sound'
import { syllabify } from '../content/syllables'
import { useMascotMood } from '../ui/useMascotMood'
import { Ningning } from '../ui/Ningning'
import { MicButton } from '../ui/MicButton'
import { PaperScene } from '../ui/PaperScene'
import { Button } from '../ui/Button'
import { BackIcon, CheckIcon, RetryIcon } from '../ui/icons'
import { goUp } from '../ui/goBack'
import { haptic } from '../ui/haptics'
import './screens.css'
import './core.css'
import './wordpop.css'

/** Dev/demo only: `?fake=1` makes the stub model "hear" the word in the current bubble. Never the default. */
const FAKE = typeof location !== 'undefined' && new URLSearchParams(location.search).has('fake')

/** "Pop them again" starts a fresh round from the same Practice words. */
export function WordPop() {
  const [round, setRound] = useState(0)
  return <WordPopRound key={round} onAgain={() => setRound((r) => r + 1)} />
}

function WordPopRound({ onAgain }: { onAgain: () => void }) {
  const recorder = useMemo(() => createRecorder(), [])
  const [state, dispatch] = useReducer(wordPopReducer, undefined, () => initialWordPop(loadProgress().practiceWords))
  const [open, setOpen] = useState<number>()
  const [level, setLevel] = useState(0)
  const [mood, setMood, beat] = useMascotMood('idle')
  const finishRef = useRef<() => void>(() => {})
  const finishing = useRef(false) // auto-stop and a tap can both fire before React re-renders
  const hasWords = state.bubbles.length > 0

  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // same rule as Reading: load the cached model, never download from here
  useEffect(() => {
    if (FAKE || !hasWords) return
    isModelCached()
      .then((cached) => (cached ? loadModel().then(() => undefined) : Promise.reject(new Error('model not cached'))))
      .catch((err) => {
        console.error('[wordpop] model not ready', err)
        if (mounted.current) dispatch({ type: 'model-unavailable' })
      })
  }, [hasWords])

  useEffect(() => {
    const offStop = recorder.onAutoStop(() => finishRef.current())
    const offLevel = recorder.onLevel((rms) => setLevel(Math.min(1, rms * 8)))
    return () => {
      offStop()
      offLevel()
      recorder.release() // the mic light goes off when the child leaves
    }
  }, [recorder])

  // a pop gets its sound and Ningning's reaction once, after the reducer has decided it
  const popped = state.bubbles.filter((b) => b.popped).length
  const lastPopped = useRef(popped)
  useEffect(() => {
    if (popped > lastPopped.current) {
      playSound('pop', loadSettings())
      haptic(20)
    }
    lastPopped.current = popped
  }, [popped])
  useEffect(() => {
    if (state.phase !== 'ready' || !state.last) return
    setMood(isDone(state) ? 'celebrating' : state.last === 'said' ? 'cheering' : 'encouraging')
  }, [state, setMood])

  const finish = async () => {
    if (state.phase !== 'listening' || finishing.current) return
    finishing.current = true
    dispatch({ type: 'stopped' })
    setMood(moodFor('mic-off'))
    try {
      const pcm = await recorder.stop()
      if (isMostlySilence(pcm)) {
        setMood(moodFor('silence'))
        return dispatch({ type: 'silence' })
      }
      if (FAKE) setFakeHeard(state.bubbles[state.current].word)
      const { text } = await transcribe(pcm)
      if (!mounted.current) return // the child left while Ningning was thinking
      // noise can pass the silence gate and come back empty: a model miss, not the child's
      if (!text.trim()) {
        setMood(moodFor('silence'))
        return dispatch({ type: 'failed' })
      }
      dispatch({ type: 'heard', text })
    } catch (err) {
      console.error('[wordpop] transcription failed', err)
      setMood(moodFor('silence'))
      dispatch({ type: 'failed' }) // a model error never costs the child a try
    } finally {
      finishing.current = false
    }
  }

  useEffect(() => {
    finishRef.current = () => void finish()
  })

  const onMic = async () => {
    if (state.phase === 'thinking') return
    haptic(12)
    if (state.phase === 'listening') return finish()
    try {
      await recorder.start()
      setMood(moodFor('mic-on'))
      dispatch({ type: 'mic-started' })
    } catch (err) {
      console.error('[wordpop] mic start failed', err)
      dispatch({ type: 'mic-failed', denied: err instanceof MicError && err.kind === 'denied' })
    }
  }

  // a tap on the current bubble opens or closes its syllables; a tap on another one moves to it, open
  const onPick = (index: number) => {
    if (index === state.current) return setOpen(open === index ? undefined : index)
    if (state.phase !== 'ready') return
    dispatch({ type: 'pick', index })
    setOpen(index)
  }

  return (
    <WordPopView
      state={state}
      mood={mood}
      beat={beat}
      level={level}
      open={open}
      onPick={onPick}
      onMic={onMic}
      onSkip={() => dispatch({ type: 'skip' })}
      onAgain={onAgain}
    />
  )
}

interface ViewProps {
  state: WordPopState
  mood: MascotMood
  beat: number
  level: number
  /** the bubble whose syllables show */
  open?: number
  onPick: (index: number) => void
  onMic: () => void
  onSkip: () => void
  onAgain: () => void
}

// one piece means there is nothing to split, so the bubble shows no second copy of the word
function Syllables({ word }: { word: string }) {
  const parts = syllabify(word)
  return parts.length > 1 ? <span className="wp-syllables" role="status">{parts.join(' · ')}</span> : null
}

const LAST_COPY = { said: 'wordpop.said', helped: 'wordpop.helped', missed: 'wordpop.missed' } as const

/** What the child sees; WordPop above owns the mic, the model and the round. */
export function WordPopView({ state, mood, beat, level, open, onPick, onMic, onSkip, onAgain }: ViewProps) {
  const { t } = useI18n()
  const total = state.bubbles.length
  const popped = state.bubbles.filter((b) => b.popped).length
  const done = isDone(state)
  const say: MessageKey =
    total === 0 ? 'wordpop.emptyTitle'
    : done ? 'wordpop.doneTitle'
    : state.notice ?? (state.last ? LAST_COPY[state.last] : state.phase === 'thinking' ? 'reading.thinking' : 'wordpop.hint')
  const micState = state.phase === 'listening' ? 'recording' : state.phase === 'thinking' ? 'thinking' : 'idle'

  return (
    <section className="wp-screen paper-stage">
      <PaperScene hills="low" />
      <header className="rd-top">
        <button type="button" className="k-icon-btn" aria-label={t('nav.back')} onClick={() => goUp('#/')}>
          <BackIcon />
        </button>
        <h1 className="wp-title">{t('wordpop.title')}</h1>
        {total > 0 && <span className="wp-count">{t('wordpop.count').replace('{n}', String(popped)).replace('{total}', String(total))}</span>}
      </header>
      <div className="rd-stage wp-stage">
        <Ningning key={beat} mood={done ? 'celebrating' : mood} size={150} label={t(say)} />
        <div className="rd-say" aria-live="polite" role={state.notice ? 'status' : undefined}>
          <p className="rd-bubble" key={say}>{t(say)}</p>
        </div>
      </div>

      {total === 0 ? (
        <div className="rd-card wp-empty">
          <p>{t('wordpop.emptyBody')}</p>
        </div>
      ) : (
        <ul className="wp-field" lang="fil">
          {state.bubbles.map((b, i) => {
            const current = i === state.current && !b.popped
            const cls = `wp-bubble${current ? ' wp-bubble--current' : ''}${b.popped ? ' wp-bubble--popped' : ''}`
            return (
              <li key={b.word} style={{ '--i': i } as React.CSSProperties}>
                {b.popped ? (
                  <span className={cls} aria-label={t('wordpop.popped').replace('{word}', b.word)}>
                    <CheckIcon size={18} width={4.5} />
                    {b.word}
                  </span>
                ) : (
                  <button type="button" className={cls} aria-pressed={current} aria-expanded={open === i} onClick={() => onPick(i)}>
                    <span className="wp-word">{b.word}</span>
                    {open === i && <Syllables word={b.word} />}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {total > 0 && !done && <p className="wp-tip">{t('wordpop.tap')}</p>}

      <div className="rd-controls">
        {total === 0 ? (
          <a className="k-btn k-btn--primary" href="#/map">{t('result.more')}</a>
        ) : done ? (
          <div className="rd-after">
            <Button variant="secondary" icon={<RetryIcon />} onClick={onAgain}>{t('wordpop.again')}</Button>
            <a className="k-btn k-btn--primary" href="#/map">{t('result.more')}</a>
          </div>
        ) : (
          <div className="rd-mic">
            <MicButton
              state={micState}
              level={state.phase === 'listening' ? level : 0}
              label={t(state.phase === 'listening' ? 'reading.stop' : 'reading.tapMic')}
              onPress={state.phase === 'thinking' ? undefined : onMic}
            />
            <p className="rd-status">{t(state.phase === 'listening' ? 'reading.stop' : 'reading.tapMic')}</p>
            {state.canSkip && state.phase === 'ready' && (
              <Button variant="secondary" className="rd-skip" onClick={onSkip}>{t('reading.skip')}</Button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
