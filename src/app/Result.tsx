// PLACEHOLDER screen — design: issue #10 (designer). Sticker on every finish: ADR-0010.
import { useI18n } from '../i18n'
import { starsFor } from '../scoring/stars'
import { loadProgress, recordStory, saveProgress } from '../game/progress'
import { useEffect, useState } from 'react'

export function Result({ storyId }: { storyId: string }) {
  const { t } = useI18n()
  const accuracy = Number(sessionStorage.getItem(`kislap.result.${storyId}`) ?? 0)
  const stars = starsFor(accuracy)
  // Record once per visit; recordStory is idempotent, so a StrictMode double run is harmless.
  const [outcome] = useState(() => recordStory(loadProgress(), storyId, stars))

  useEffect(() => {
    saveProgress(outcome.progress)
  }, [outcome])

  return (
    <section className="stack center">
      <h1>{t('result.title')}</h1>
      <p className="stars" aria-label={`${t('result.stars')}: ${stars} / 3`}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
      {stars === 0 && <p>{t('result.lowStars')}</p>}
      {outcome.newSticker && <p data-sticker={outcome.newSticker}>{t('result.sticker')}</p>}
      <a className="big" href="#/map">{t('reading.next')}</a>
    </section>
  )
}
