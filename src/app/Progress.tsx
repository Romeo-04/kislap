// PLACEHOLDER screen — firefly jar: issue #12 (designer); progress QR: issue #47 (model engineer).
import { useI18n } from '../i18n'
import { loadProgress } from '../game/progress'
import { STORIES } from '../content/stories'
import { stickerArt } from '../content/stickers'
import { GameIcon } from '../ui/GameIcon'

export function Progress() {
  const { t } = useI18n()
  const p = loadProgress()
  return (
    <section className="stack center collection-page">
      <span className="collection-emblem"><GameIcon name="star" size={40} /></span>
      <h1>{t('progress.title')}</h1>
      <p>{t('progress.stickers')}: {p.stickers.length} · {p.streak.days} {t('progress.days')}</p>
      <div className="sticker-grid">{STORIES.flatMap(story => [false, true].map(gold => {
        const id = `sticker-${story.id}${gold ? '-gold' : ''}`
        const art = stickerArt(id, STORIES)!
        const earned = p.stickers.includes(id)
        return <figure className={`sticker-slot ${earned ? 'sticker-slot--earned' : ''}`} key={id}>
          <img src={earned ? art.src : art.lockedSrc} alt={art.name} />
          <figcaption><strong>{art.name}</strong><span>{earned ? (t('progress.collected')) : gold ? (t('progress.needGold')) : (t('progress.needFinish'))}</span></figcaption>
        </figure>
      }))}</div>
      <a className="candy-button" href="#/map"><GameIcon name="book" />{t('result.more')}</a>
    </section>
  )
}
