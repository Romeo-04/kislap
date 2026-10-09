// Home (Claude Design part 2, #10): the wordmark tag, Ningning on a stick between paper bushes,
// one yellow Play, the readiness slip, the jar and Word Pop. Desktop: the tag and buttons left, Ningning right.
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { loadProgress, localDate, saveProgress, touchStreak } from '../game/progress'
import { Ningning } from '../ui/Ningning'
import { Wordmark } from '../ui/Wordmark'
import { PaperScene } from '../ui/PaperScene'
import { LangToggle } from '../ui/LangToggle'
import { OfflineBadge } from '../ui/OfflineBadge'
import { Bush } from '../ui/Bush'
import { GearIcon, JarIcon, PlayIcon } from '../ui/icons'
import './screens.css'
import './core.css'

export function Home() {
  const { t } = useI18n()
  const [streak] = useState(() => touchStreak(loadProgress(), localDate()))
  useEffect(() => saveProgress({ ...loadProgress(), streak: streak.progress.streak }), [streak])
  return (
    <section className="hm-screen paper-stage">
      {/* the bushes grow on the hills, so a page that scrolls never pulls them off the ground */}
      <PaperScene hills="high">
        <Bush className="hm-bush hm-bush--left" />
        <Bush className="hm-bush hm-bush--right" flip />
      </PaperScene>
      <div className="hm-top">
        <LangToggle />
        <a className="k-icon-btn k-icon-btn--settings" href="#/settings" aria-label={t('settings.title')}>
          <GearIcon />
        </a>
      </div>
      <div className="hm-title">
        {/* the twine runs up past the top of the screen: the sign hangs from above */}
        <Wordmark width={320} rope={300} className="hm-sign" />
        {streak.welcomeBack && <p className="hm-welcome" role="status">{t('home.welcomeBack')}</p>}
      </div>
      <div className="hm-friend">
        <Ningning mood="idle" glow={0.7} stick={150} size={210} label={t('mascot.idle')} />
      </div>
      <div className="hm-actions">
        <a className="k-btn k-btn--primary hm-play" href="#/map">
          <span className="hm-play__shine" aria-hidden="true" />
          <PlayIcon />
          <span>{t('home.play')}</span>
        </a>
        <OfflineBadge />
      </div>
      <nav className="hm-bottom" aria-label={t('home.activities')}>
        <a className="hm-jar" href="#/progress">
          <JarIcon />
          <span>{t('progress.title')}</span>
        </a>
        <a className="hm-pop" href="#/wordpop">{t('wordpop.title')}</a>
      </nav>
    </section>
  )
}
