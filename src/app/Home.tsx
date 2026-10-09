import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { loadProgress, localDate, saveProgress, touchStreak } from '../game/progress'
import { AdventureMap } from '../ui/AdventureMap'
import { Ningning } from '../ui/Ningning'
import { GameIcon } from '../ui/GameIcon'
import { PlayIcon } from '../ui/icons'

export function Home() {
  const { t, lang } = useI18n()
  const fil = lang === 'fil'
  const [streak] = useState(() => touchStreak(loadProgress(), localDate()))
  useEffect(() => saveProgress({ ...loadProgress(), streak: streak.progress.streak }), [streak])
  const progress = loadProgress()
  return <>
    <div className="home-layout">
      <section className="welcome">
        <div className="welcome-friend"><Ningning mood="cheering" size={136} /><span className="speech-bubble">{fil ? 'Tara, magbasa tayo!' : 'Let’s read together!'}</span></div>
        <h1>{fil ? <>Bawat kuwento,<br />bagong <span>kislap!</span></> : <>Little stories.<br />Big <span>sparkles!</span></>}</h1>
        <p className="welcome-description">{fil ? 'Samahan si Ningning sa isang makulay na paglalakbay. Magbasa, mangolekta ng mga bituin, at tuklasin ang iyong galing!' : 'Join Ningning on a colorful adventure. Read a story, collect stars, and discover how brightly you can shine!'}</p>
        {streak.welcomeBack && <p role="status">{t('home.welcomeBack')}</p>}
        <a href="#/map" className="candy-button"><PlayIcon />{t('home.play')}<GameIcon name="arrow" /></a>
        <p className="welcome-note">{fil ? 'Isang kuwento. Isang bagong simula.' : 'One little story. A whole new adventure.'}</p>
      </section>
      <AdventureMap />
    </div>
    <section className="activity-strip" aria-label={fil ? 'Ang iyong paglalakbay' : 'Your adventure'}>
      <div className="daily-progress"><span className="activity-icon activity-icon--peach"><GameIcon name="flame" size={28} /></span><div><h2>{streak.progress.streak.days} {fil ? 'araw ng pagbasa' : streak.progress.streak.days === 1 ? 'day of reading' : 'days of reading'}</h2><p>{fil ? 'Kaunting basa, araw-araw!' : 'A little reading goes a long way!'}</p></div></div>
      <a className="activity-link" href="#/progress"><span className="activity-icon activity-icon--pink"><GameIcon name="star" size={28} /></span><div><h2>{t('progress.title')}</h2><p>{progress.stickers.length} / 6 {fil ? 'sticker na nakolekta' : 'stickers collected'}</p></div><GameIcon name="arrow" /></a>
      <a className="activity-link" href="#/wordpop"><span className="activity-icon activity-icon--blue"><GameIcon name="bubble" size={28} /></span><div><h2>Word Pop</h2><p>{fil ? 'Magsanay ng mga salita' : 'Make time for word practice'}</p></div><GameIcon name="arrow" /></a>
    </section>
  </>
}
