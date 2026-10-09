import { useI18n } from '../i18n'
import { STORIES } from '../content/stories'
import { loadProgress } from '../game/progress'
import { StarRow } from './StarRow'
import { GameIcon } from './GameIcon'

export function AdventureMap({ expanded = false }: { expanded?: boolean }) {
  const { lang, t } = useI18n()
  const progress = loadProgress()
  const next = STORIES.findIndex(story => !(story.id in progress.stars))
  return <div className={`adventure-map ${expanded ? 'adventure-map--expanded' : ''}`}>
    <div className="map-caption"><GameIcon name="map" size={20} /><span>{lang === 'fil' ? 'Ang iyong pakikipagsapalaran' : 'Your reading adventure'}</span><span>3 {lang === 'fil' ? 'kuwento' : 'stories'}</span></div>
    <div className="map-cloud map-cloud--one" /><div className="map-cloud map-cloud--two" />
    <div className="map-hill map-hill--back" /><div className="map-hill map-hill--front" />
    <div className="map-trail" aria-hidden="true"><svg viewBox="0 0 600 500" preserveAspectRatio="none"><path className="map-trail--wide" d="M160 410 C-20 310 100 210 295 270 S580 185 435 125" /><path className="map-trail--narrow" d="M95 410 C95 340 505 340 505 250 S95 185 95 110" /></svg></div>
    <div className="map-decor map-decor--flower"><img src="/stickers/sticker-sampaguita.svg" alt="" /></div>
    <div className="map-decor map-decor--house"><img src="/stickers/sticker-kubo.svg" alt="" /></div>
    <div className="map-decor map-decor--lantern"><img src="/stickers/sticker-parol.svg" alt="" /></div>
    {STORIES.map((story, i) => <a className={`story-stop story-stop--${i + 1} ${i === (next < 0 ? 0 : next) ? 'story-stop--next' : ''}`} href={`#/reading/${story.id}`} key={story.id} aria-label={`${story.title[lang]}, ${t(`level.${story.level}`)}, ${progress.stars[story.id] ?? 0} / 3`}>
      <span className="story-stop__number">{i + 1}<span className="story-stop__shine" /></span>
      <span className="story-stop__label"><span className="story-stop__difficulty">{t(`level.${story.level}`)}</span><strong>{story.title[lang]}</strong><StarRow stars={progress.stars[story.id] ?? 0} size={22} /></span>
    </a>)}
    <span className="map-start"><GameIcon name="sparkle" size={16} />{lang === 'fil' ? 'Dito nagsisimula ang galing!' : 'Great things start here!'}</span>
  </div>
}
