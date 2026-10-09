// PLACEHOLDER screen — mic check: issue #45 (designer).
import { useI18n } from '../i18n'

export function MicCheck() {
  const { t } = useI18n()
  return (
    <section className="stack center">
      <p>{t('miccheck.say')} “{t('miccheck.phrase')}”</p>
      <a href="#/">{t('nav.back')}</a>
    </section>
  )
}
