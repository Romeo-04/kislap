import { useI18n } from '../i18n'
import { AdventureMap } from '../ui/AdventureMap'
import { GameIcon } from '../ui/GameIcon'

export function StoryMap() {
  const { t, lang } = useI18n()
  return <section className="story-map-page">
    <div className="map-heading"><div><h1>{t('map.title')}</h1><p>{lang === 'fil' ? 'Bawat kuwento ay isang bagong pakikipagsapalaran.' : 'Every story is a new adventure waiting for you.'}</p></div><a className="text-link" href="#/"><GameIcon name="arrow" />{t('nav.back')}</a></div>
    <AdventureMap expanded />
  </section>
}
