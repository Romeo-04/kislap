// Result screen (issue #3 wiring; visual design: #10). Sticker on every finish: ADR-0010.
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { clearResult, resultFor } from '../game/session'
import { addPracticeWords, loadProgress, recordStory, saveProgress } from '../game/progress'
import { loadSettings } from '../game/settings'
import { playSound } from '../game/sound'
import { Ningning } from '../ui/Ningning'
import { StarRow } from '../ui/StarRow'
import { Confetti } from '../ui/Confetti'

export function Result({ storyId }: { storyId: string }) {
  const { t } = useI18n()
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
  }, [outcome, storyId])

  if (!result || !outcome) {
    return (
      <section className="stack center">
        <p>{t('reading.notFound')}</p>
        <a className="big" href="#/map">{t('result.more')}</a>
      </section>
    )
  }

  const gold = outcome.newSticker?.endsWith('-gold')
  return (
    <section className="stack center">
      {result.stars > 0 && <Confetti />}
      <Ningning mood="celebrating" size={160} label={t('result.title')} />
      <h1>{t('result.title')}</h1>
      <StarRow stars={result.stars} arch />
      {result.stars === 0 && <p>{t('result.lowStars')}</p>}
      {outcome.newSticker && <p data-sticker={outcome.newSticker}>{t(gold ? 'result.bonus' : 'result.sticker')}</p>}
      <a className="big" href="#/map">{t('result.more')}</a>
    </section>
  )
}
