// Parent/teacher gate: a grown-up question before adult screens (adding or deleting a story).
import { useState, type ReactNode } from 'react'
import { useI18n } from '../i18n'
import { isUnlocked, lock, makeChallenge, tryUnlock } from '../game/parentGate'
import { Button } from './Button'

export function ParentGate({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(isUnlocked)
  const [challenge, setChallenge] = useState(() => makeChallenge())
  const [answer, setAnswer] = useState('')
  const [missed, setMissed] = useState(false)

  if (open) {
    return (
      <>
        {children}
        <div className="pg-lock">
          <button type="button" className="ms-delete" onClick={() => { lock(); setOpen(false) }}>
            {t('gate.lock')}
          </button>
        </div>
      </>
    )
  }

  const submit = () => {
    if (tryUnlock(challenge, answer)) return setOpen(true)
    // a child may be trying: a new question, and no "wrong"
    setMissed(true)
    setAnswer('')
    setChallenge(makeChallenge())
  }

  return (
    <form className="ms-card pg-card" onSubmit={(e) => { e.preventDefault(); submit() }}>
      <h2 className="ms-h2">{t('gate.title')}</h2>
      <p className="ms-intro">
        {t('gate.ask').replace('{a}', String(challenge.a)).replace('{b}', String(challenge.b))}
      </p>
      <label className="ms-field">
        <span>{t('gate.answer')}</span>
        <input inputMode="numeric" autoComplete="off" value={answer} onChange={(e) => setAnswer(e.target.value)} />
      </label>
      {missed && <p className="ms-error" role="status">{t('gate.retry')}</p>}
      <Button onClick={submit}>{t('gate.go')}</Button>
    </form>
  )
}
