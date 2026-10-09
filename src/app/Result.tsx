// Result screen (issue #3 wiring; paper puppet look: #10). Sticker on every finish: ADR-0010.
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { clearResult, resultFor } from '../game/session'
import { addPracticeWords, loadProgress, recordStory, saveProgress } from '../game/progress'
import { loadSettings } from '../game/settings'
import { playSound } from '../game/sound'
import { STORIES } from '../content/stories'
import { stickerArt } from '../content/stickers'
import type { Stars } from '../scoring/stars'
import { Ningning } from '../ui/Ningning'
import { StarRow } from '../ui/StarRow'
import { Confetti } from '../ui/Confetti'
import { PaperScene } from '../ui/PaperScene'
import { haptic } from '../ui/haptics'
import { NotFound } from './Reading'
import './screens.css'
import './core.css'

export function Result({ storyId }: { storyId: string }) {
  // Only a finished Reading session has a result; a direct link records nothing.
  const [result] = useState(() => resultFor(storyId))
  // recordStory is idempotent, so a StrictMode double run cannot add a second sticker.
  const [outcome] = useState(() =>
    result ? recordStory(addPracticeWords(loadProgress(), result.practiceWords), storyId, result.stars) : undefined,
  )

  useEffect(() => {
    if (!outcome) return
    saveProgress(outcome.progress)
    clearResult(storyId)
    playSound(outcome.newSticker ? 'sticker' : 'star', loadSettings())
    if (outcome.newSticker) haptic([18, 60, 28])
  }, [outcome, storyId])

  if (!result || !outcome) return <NotFound />
  return <ResultView storyId={storyId} stars={result.stars} newSticker={outcome.newSticker} />
}

/** 0 stars is still a win: confetti, the sticker and a celebrating Ningning stay. Only the button order,
 * a softer glow (0.75, as in the design) and the try-again line change. */
export function ResultView({ storyId, stars, newSticker }: { storyId: string; stars: Stars; newSticker?: string }) {
  const { t } = useI18n()
  const sticker = stickerArt(`sticker-${storyId}`, STORIES)
  const bonus = stars === 3 ? stickerArt(`sticker-${storyId}-gold`, STORIES) : undefined
  const more = { href: '#/map', label: t('result.more') }
  const again = { href: `#/reading/${storyId}`, label: t('reading.retry') }
  const [first, second] = stars === 0 ? [again, more] : [more, again]
  return (
    <section className="rs-screen paper-stage">
      <PaperScene hills="mid" />
      <Confetti />
      <div className="rs-head">
        <h1 className="rs-title">{t('result.title')}</h1>
        <StarRow stars={stars} arch />
      </div>
      <div className="rs-stage">
        {sticker && <img className="rs-sticker rs-sticker--main" src={sticker.src} alt={sticker.name} width={136} height={136} />}
        {bonus && <img className="rs-sticker rs-sticker--bonus" src={bonus.src} alt={bonus.name} width={88} height={88} />}
        <span className="rs-friend">
          <Ningning mood="celebrating" glow={stars === 0 ? 0.75 : undefined} size={160} stick={250} label={t('result.title')} />
        </span>
      </div>
      {(newSticker || stars === 0) && (
        <div className="rs-card">
          {stars === 0 && <p>{t('result.lowStars')}</p>}
          {newSticker === `sticker-${storyId}` && <p data-sticker={newSticker}>{t('result.sticker')}</p>}
          {newSticker === `sticker-${storyId}-gold` && <p data-sticker={newSticker}>{t('result.bonus')}</p>}
        </div>
      )}
      <div className="rs-actions">
        <a className="k-btn k-btn--primary" href={first.href}>{first.label}</a>
        <a className="k-btn k-btn--secondary" href={second.href}>{second.label}</a>
      </div>
    </section>
  )
}
