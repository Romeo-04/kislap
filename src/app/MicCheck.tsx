// Mic check (issue #45, Claude Design layer 5). Energy only: no speech model runs here.
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { createRecorder } from '../asr/audio'
import { SEGMENTS, initialMicCheck, levelFill, litSegments, micCheckReducer, type MicCheckState } from '../game/micCheck'
import { Ningning } from '../ui/Ningning'
import { TopBar } from '../ui/TopBar'
import { Button } from '../ui/Button'
import { CheckIcon } from '../ui/icons'
import { go } from './router'
import './screens.css'

// works with the real recorder's MicError (#2) and with the browser's own error
const isDenied = (err: unknown) =>
  (err as { kind?: string })?.kind === 'denied' || (err as { name?: string })?.name === 'NotAllowedError'

function LevelBar({ fill, tone }: { fill: number; tone: 'voice' | 'clear' | 'noise' }) {
  const lit = litSegments(fill)
  return (
    <div className={`mc-bar mc-bar--${tone}`} role="meter" aria-valuemin={0} aria-valuemax={SEGMENTS} aria-valuenow={lit}>
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <span key={i} className={i < lit ? 'mc-seg mc-seg--on' : 'mc-seg'} />
      ))}
      <span className="mc-line" aria-hidden="true" />
    </div>
  )
}

function NoisyPictures() {
  // simple room drawings in the kit's ink style: a loud TV, then a quiet corner with a pillow
  return (
    <div className="mc-pictures" aria-hidden="true">
      <svg viewBox="0 0 120 96" className="mc-picture mc-picture--loud">
        <rect x="18" y="22" width="64" height="44" rx="8" fill="#FFFFFF" stroke="#1E2B1F" strokeWidth="3" />
        <path d="M40 66 L36 78 M60 66 L64 78" stroke="#1E2B1F" strokeWidth="3" strokeLinecap="round" />
        <path d="M90 32 Q98 44 90 56 M98 26 Q110 44 98 62" fill="none" stroke="#F07F2A" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
      <svg width="34" height="24" viewBox="0 0 34 24" className="mc-arrow">
        <path d="M3 12 H28 M20 4 L29 12 L20 20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg viewBox="0 0 120 96" className="mc-picture mc-picture--quiet">
        <path d="M14 78 H106" stroke="#1E2B1F" strokeWidth="3" strokeLinecap="round" />
        <rect x="30" y="50" width="60" height="28" rx="12" fill="#FFFFFF" stroke="#1E2B1F" strokeWidth="3" />
        <path d="M82 16 A14 14 0 1 0 96 34 A11 11 0 1 1 82 16 Z" fill="#FFC62E" stroke="#1E2B1F" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function DeniedSteps() {
  const { t } = useI18n()
  return (
    <ol className="mc-steps">
      <li className="mc-step">
        <span className="mc-num">1</span>
        <div className="mc-step-body">
          <span>{t('mic.step1')}</span>
          <div className="mc-address">
            <span className="mc-tune">
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M2 5 H16 M2 13 H16" stroke="#1E2B1F" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="6" cy="5" r="2.5" fill="#FFFFFF" stroke="#1E2B1F" strokeWidth="2" />
                <circle cx="12" cy="13" r="2.5" fill="#FFFFFF" stroke="#1E2B1F" strokeWidth="2" />
              </svg>
            </span>
            {typeof location === 'undefined' ? 'kislap.vercel.app' : location.host}
          </div>
        </div>
      </li>
      <li className="mc-step">
        <span className="mc-num">2</span>
        <div className="mc-step-body">
          <span>{t('mic.step2')}</span>
          <div className="mc-permission">
            <span>{t('mic.label')}</span>
            <span className="st-track st-track--on st-track--small" aria-hidden="true"><span className="st-knob" /></span>
          </div>
        </div>
      </li>
      <li className="mc-step">
        <span className="mc-num">3</span>
        <div className="mc-step-body"><span>{t('mic.step3')}</span></div>
      </li>
    </ol>
  )
}

/** The screen for one mic-check state; kept apart from the microphone so it can be tested. */
export function MicCheckView({ state, fill, onRetry, onDone }: { state: MicCheckState; fill: number; onRetry?: () => void; onDone?: () => void }) {
  const { t } = useI18n()
  const { phase } = state

  if (phase === 'denied' || phase === 'unavailable') {
    return (
      <section className="mc-screen">
        <TopBar title={t('miccheck.title')} />
        <div className="mc-denied">
          <Ningning mood="encouraging" glow={0.45} size={120} />
          <p className="mc-denied-text">{t(phase === 'denied' ? 'mic.denied' : 'mic.unavailable')}</p>
        </div>
        {phase === 'denied' && <DeniedSteps />}
        <div className="mc-bottom">
          <Button onClick={onRetry} className="mc-action">{t('reading.retry')}</Button>
        </div>
      </section>
    )
  }

  const heard = phase === 'heard'
  const noisy = phase === 'noisy'
  return (
    <section className="mc-screen">
      <TopBar title={t('miccheck.title')} />
      <div className={heard || noisy ? 'mc-stage mc-stage--talk' : 'mc-stage'}>
        <Ningning mood={heard ? 'cheering' : noisy ? 'encouraging' : 'listening'} glow={heard ? 0.95 : noisy ? 0.5 : 0.6} size={heard || noisy ? 190 : 200} />
        {heard && <p className="mc-bubble mc-bubble--big">{t('miccheck.heard')}</p>}
        {noisy && <p className="mc-bubble">{t('miccheck.noisy')}</p>}
      </div>
      {noisy ? (
        <NoisyPictures />
      ) : phase === 'baseline' ? (
        <div className="mc-say mc-say--wait" aria-hidden="true" />
      ) : (
        <div className="mc-say">
          <span className="mc-say-label">{t('miccheck.say')}</span>
          <span className="mc-phrase">"{t('miccheck.phrase')}"</span>
        </div>
      )}
      <div className="mc-meter">
        <LevelBar fill={heard ? Math.max(fill, 0.8) : fill} tone={heard ? 'clear' : noisy ? 'noise' : 'voice'} />
        {heard ? (
          <p className="mc-clear"><CheckIcon />{t('miccheck.clear')}</p>
        ) : noisy ? (
          <p className="mc-note">{t('miccheck.noiseOnly')}</p>
        ) : (
          <p className="mc-labels"><span>{t('miccheck.quiet')}</span><span className="mc-enough">{t('miccheck.enough')}</span></p>
        )}
      </div>
      <div className="mc-bottom">
        {heard ? (
          <Button onClick={onDone} className="mc-action mc-action--done">{t('miccheck.done')}</Button>
        ) : noisy ? (
          <Button onClick={onRetry} className="mc-action">{t('reading.retry')}</Button>
        ) : (
          <p className="mc-status">{t('reading.listening')}</p>
        )}
      </div>
    </section>
  )
}

export function MicCheck() {
  const recorder = useMemo(() => createRecorder(), [])
  const [state, dispatch] = useReducer(micCheckReducer, initialMicCheck)
  const [fill, setFill] = useState(0)
  const [attempt, setAttempt] = useState(0)
  // the next start waits for the last stop: the real recorder closes its stream asynchronously
  const stopping = useRef<Promise<unknown>>(Promise.resolve())

  useEffect(() => {
    let live = true
    const off = recorder.onLevel((rms) => {
      if (!live) return
      setFill(levelFill(rms))
      dispatch({ type: 'level', rms, at: performance.now() })
    })
    stopping.current
      .then(() => (live ? recorder.start() : undefined))
      .catch((err) => {
        if (live) dispatch({ type: isDenied(err) ? 'denied' : 'unavailable' })
      })
    return () => {
      live = false
      off()
      stopping.current = recorder.stop().catch(() => {})
    }
  }, [recorder, attempt])

  const retry = () => {
    dispatch({ type: 'retry' })
    setFill(0)
    setAttempt((n) => n + 1)
  }

  return <MicCheckView state={state} fill={fill} onRetry={retry} onDone={() => go('map')} />
}
