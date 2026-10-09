// PLACEHOLDER screen — design: issue #10 (designer).
import { useI18n } from '../i18n'
import { go } from './router'

export function Home() {
  const { t, lang, setLang } = useI18n()
  return (
    <section className="stack center">
      <div className="mascot-placeholder" aria-hidden>✨</div>
      <h1>Kislap</h1>
      <p>{t('app.tagline')}</p>
      <button className="big" onClick={() => go('map')}>{t('home.play')}</button>
      <button onClick={() => setLang(lang === 'fil' ? 'en' : 'fil')}>{t('lang.toggle')}</button>
      <nav className="row">
        <a href="#/progress">{t('progress.title')}</a>
        <a href="#/miccheck">🎤</a>
      </nav>
    </section>
  )
}
