// PLACEHOLDER screen — firefly jar: issue #12 (designer); progress QR: issue #47 (model engineer).
import { useI18n } from '../i18n'
import { loadProgress } from '../game/progress'

export function Progress() {
  const { t } = useI18n()
  const p = loadProgress()
  return (
    <section className="stack center">
      <h1>{t('progress.title')}</h1>
      <p>{t('progress.stickers')}: {p.stickers.length} · {p.streak.days} {t('progress.days')}</p>
      <a href="#/">{t('nav.back')}</a>
    </section>
  )
}
