import { STORIES } from '../content/stories'
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { loadProgress, localDate, saveProgress, touchStreak } from '../game/progress'
import { AdventureMap } from '../ui/AdventureMap'
import { Ningning } from '../ui/Ningning'
import { GameIcon } from '../ui/GameIcon'
import { PlayIcon } from '../ui/icons'

/** One finishing sticker and one gold sticker per story (ADR-0010). */
const STICKER_TOTAL = STORIES.length * 2

export function Home() {
  const { t } = useI18n()
  const [streak] = useState(() => touchStreak(loadProgress(), localDate()))
  useEffect(() => saveProgress({ ...loadProgress(), streak: streak.progress.streak }), [streak])
  const progress = loadProgress()
  return <>
    <div className="home-layout">
      <section className="welcome">
        <div className="welcome-friend"><Ningning mood="cheering" size={136} /><span className="speech-bubble">{t('home.bubble')}</span></div>
        <h1>{t('home.headline1')}<br />{t('home.headline2')} <span>{t('home.headlineSpark')}</span></h1>
        <p className="welcome-description">{t('home.description')}</p>
        {streak.welcomeBack && <p role="status">{t('home.welcomeBack')}</p>}
        <a href="#/map" className="candy-button"><PlayIcon />{t('home.play')}<GameIcon name="arrow" /></a>
        <p className="welcome-note">{t('home.note')}</p>
      </section>
      <AdventureMap />
    </div>
    <section className="activity-strip" aria-label={t('home.activities')}>
      <div className="daily-progress"><span className="activity-icon activity-icon--peach"><GameIcon name="flame" size={28} /></span><div><h2>{t(streak.progress.streak.days === 1 ? 'home.daysOne' : 'home.daysMany').replace('{n}', String(streak.progress.streak.days))}</h2><p>{t('home.streakNote')}</p></div></div>
      <a className="activity-link" href="#/progress"><span className="activity-icon activity-icon--pink"><GameIcon name="star" size={28} /></span><div><h2>{t('progress.title')}</h2><p>{progress.stickers.length} / {STICKER_TOTAL} {t('home.stickersCollected')}</p></div><GameIcon name="arrow" /></a>
      <a className="activity-link" href="#/wordpop"><span className="activity-icon activity-icon--blue"><GameIcon name="bubble" size={28} /></span><div><h2>{t('wordpop.title')}</h2><p>{t('home.wordpopNote')}</p></div><GameIcon name="arrow" /></a>
    </section>
  </>
}
