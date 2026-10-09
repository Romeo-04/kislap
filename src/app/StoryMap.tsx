// PLACEHOLDER screen — design: issue #10 (designer).
import { useI18n } from '../i18n'
import { STORIES } from '../content/stories'
import { loadProgress } from '../game/progress'
import { go } from './router'

export function StoryMap() {
  const { t, lang } = useI18n()
  const stars = loadProgress().stars
  return (
    <section className="stack">
      <h1>{t('map.title')}</h1>
      {STORIES.map((s) => (
        <button key={s.id} className="big" onClick={() => go(`reading/${s.id}`)}>
          {s.title[lang]} · {t(`level.${s.level}`)} · {'★'.repeat(stars[s.id] ?? 0)}
        </button>
      ))}
      <a href="#/">{t('nav.back')}</a>
    </section>
  )
}
