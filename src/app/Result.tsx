// PLACEHOLDER screen — design: issue #10 (designer). Sticker on every finish: ADR-0010.
import { useI18n } from '../i18n'
import { starsFor } from '../scoring/stars'
import { loadProgress, recordStory, saveProgress } from '../game/progress'
import { useEffect, useMemo } from 'react'

export function Result({ storyId }: { storyId: string }) {
  const { t } = useI18n()
  const accuracy = Number(sessionStorage.getItem(`kislap.result.${storyId}`) ?? 0)
  const stars = useMemo(() => starsFor(accuracy), [accuracy])

  useEffect(() => {
    saveProgress(recordStory(loadProgress(), storyId, stars).progress)
  }, [storyId, stars])

  return (
    <section className="stack center">
      <h1>{t('result.title')}</h1>
      <p className="stars" aria-label={`${t('result.stars')}: ${stars} / 3`}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
      {stars === 0 && <p>{t('result.lowStars')}</p>}
      <p>{t('result.sticker')}</p>
      <a className="big" href="#/map">{t('reading.next')}</a>
    </section>
  )
}
