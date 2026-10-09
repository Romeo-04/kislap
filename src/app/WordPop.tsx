// PLACEHOLDER screen — Word Pop: issue #13 (designer).
import { useI18n } from '../i18n'

export function WordPop() {
  const { t } = useI18n()
  return (
    <section className="stack center">
      <h1>{t('wordpop.title')}</h1>
      <a href="#/map">{t('nav.back')}</a>
    </section>
  )
}
