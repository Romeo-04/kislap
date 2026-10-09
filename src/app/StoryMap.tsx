import { useI18n } from '../i18n'
import { AdventureMap } from '../ui/AdventureMap'
import { GameIcon } from '../ui/GameIcon'

export function StoryMap() {
  const { t } = useI18n()
  return <section className="story-map-page">
    <div className="map-heading"><div><h1>{t('map.title')}</h1><p>{t('map.subtitle')}</p></div><a className="text-link" href="#/"><GameIcon name="arrow" />{t('nav.back')}</a></div>
    <AdventureMap expanded />
  </section>
}
