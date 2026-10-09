// PLACEHOLDER screen — design: issue #10 (designer).
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { loadProgress, localDate, saveProgress, touchStreak } from '../game/progress'
import { go } from './router'

export function Home() {
  const { t, lang, setLang } = useI18n()
  const [streak] = useState(() => touchStreak(loadProgress(), localDate()))
  useEffect(() => saveProgress(streak.progress), [streak])
  return (
    <section className="stack center">
      <div className="mascot-placeholder" aria-hidden>✨</div>
      <h1>Kislap</h1>
      <p>{t('app.tagline')}</p>
      {streak.welcomeBack && <p role="status">{t('home.welcomeBack')}</p>}
      <button className="big" onClick={() => go('map')}>{t('home.play')}</button>
      <button onClick={() => setLang(lang === 'fil' ? 'en' : 'fil')}>{t('lang.toggle')}</button>
      <nav className="row">
        <a href="#/progress">{t('progress.title')}</a>
        <a href="#/miccheck" aria-label={t('miccheck.title')}>🎤</a>
      </nav>
    </section>
  )
}
