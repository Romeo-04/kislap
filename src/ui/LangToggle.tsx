import { useI18n } from '../i18n'
import './kit.css'

/** Shows the other language's name; tapping switches the whole UI. */
export function LangToggle() {
  const { t, lang, setLang } = useI18n()
  return (
    <button type="button" className="k-lang" lang={lang === 'fil' ? 'en' : 'fil'} onClick={() => setLang(lang === 'fil' ? 'en' : 'fil')}>
      {t('lang.toggle')}
    </button>
  )
}
