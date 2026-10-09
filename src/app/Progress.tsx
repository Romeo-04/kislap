// Firefly jar (issue #12, Claude Design part 2 "Ang aking garapon"): the jar is the hero. Earned
// stickers float inside on their own glow; the ones still to come wait as soft shadows. Tap one to
// see it big. Below: days of reading (never "in a row"), today's goal ring, stars per story.
// Progress QR export: issue #47 (model engineer).
import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { loadProgress } from '../game/progress'
import { DAILY_GOAL, clearWelcomeBack, hasWelcomeBack, localDay, storiesToday } from '../game/dailyGoal'
import { STORIES } from '../content/stories'
import { stickerArt, type StickerName } from '../content/stickers'
import { PaperScene } from '../ui/PaperScene'
import { TopBar } from '../ui/TopBar'
import { StarRow } from '../ui/StarRow'
import './screens.css'
import './core.css'
import './jar.css'

// where each sticker sits in the jar, from the part 2 frame (390 x 330 box): x, y, size, tilt
const SLOTS: Record<StickerName, [number, number, number, number]> = {
  sampaguita: [112, 92, 76, -8],
  alitaptap: [208, 142, 76, 6],
  kubo: [110, 208, 76, 4],
  jeep: [214, 76, 66, 0],
  kalabaw: [216, 236, 66, 0],
  parol: [162, 152, 56, 0],
}
const JAR = 'M124 48 Q74 70 74 130 L74 284 Q74 318 108 318 L282 318 Q316 318 316 284 L316 130 Q316 70 266 48 Z'
const RING = 2 * Math.PI * 22
const title = (name: string) => name[0].toUpperCase() + name.slice(1)

export interface Slot {
  id: string
  name: StickerName
  src: string
  earned: boolean
  gold: boolean
}

function GoalRing({ done }: { done: number }) {
  const shown = Math.min(done, DAILY_GOAL)
  return (
    <svg className="jr-ring" width="44" height="44" viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="28" r="22" fill="none" stroke="var(--paper-warm)" strokeWidth="9" />
      {shown > 0 && (
        <circle cx="28" cy="28" r="22" fill="none" stroke="var(--correct)" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${((RING * shown) / DAILY_GOAL).toFixed(1)} ${(RING * 2).toFixed(1)}`} transform="rotate(-90 28 28)" />
      )}
      <circle cx="28" cy="28" r="27" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="28" cy="28" r="17" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <text x="28" y="33" textAnchor="middle" fontFamily="Baloo 2" fontWeight="800" fontSize="15" fill="var(--ink)">{shown}/{DAILY_GOAL}</text>
    </svg>
  )
}

/** The sticker seen big, with its name and, if it is still to come, what earns it. */
export function StickerZoom({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  const { t } = useI18n()
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    close.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      opener?.focus() // back to the sticker that was tapped
    }
  }, [onClose])
  const status = slot.earned ? 'progress.collected' : slot.gold ? 'progress.needGold' : 'progress.needFinish'
  return (
    <div className="jr-zoom" role="dialog" aria-modal="true" aria-labelledby="jr-zoom-name" onClick={onClose}>
      <div className="jr-zoom__card" onClick={(e) => e.stopPropagation()}>
        <img src={slot.src} alt="" width={200} height={200} />
        <h2 id="jr-zoom-name" className="jr-zoom__name">{title(slot.name)}</h2>
        <p className="jr-zoom__status">{t(status)}</p>
        <button ref={close} type="button" className="k-btn k-btn--secondary" onClick={onClose}>{t('shell.close')}</button>
      </div>
    </div>
  )
}

export function Progress() {
  const { t, lang } = useI18n()
  const p = loadProgress()
  const today = storiesToday(localDay())
  // read in render, cleared in an effect: the note shows once, and StrictMode's second render still sees it
  const [welcome] = useState(hasWelcomeBack)
  useEffect(() => clearWelcomeBack(), [])
  const [zoom, setZoom] = useState<Slot>()
  const closeZoom = useCallback(() => setZoom(undefined), [])

  const slots: Slot[] = STORIES.flatMap((story) =>
    [false, true].map((gold) => {
      const id = `sticker-${story.id}${gold ? '-gold' : ''}`
      const art = stickerArt(id, STORIES)!
      const earned = p.stickers.includes(id)
      return { id, name: art.name, src: earned ? art.src : art.lockedSrc, earned, gold }
    }),
  )

  return (
    <section className="jr-screen paper-stage">
      <PaperScene hills="low" />
      <TopBar title={t('progress.title')} />
      {welcome && <p className="jr-welcome" role="status">{t('progress.welcome')}</p>}
      <div className="jr-jar">
        <svg className="jr-glass" viewBox="0 0 390 330" aria-hidden="true">
          <rect x="120" y="40" width="150" height="8" fill="var(--cap-shade)" />
          <rect x="120" y="14" width="150" height="34" rx="10" fill="var(--cap)" stroke="var(--edge)" strokeWidth="4" />
          <path d={JAR} fill="#EAF7FD" stroke="var(--edge)" strokeWidth="6" />
          <path d="M96 120 Q96 92 120 80" fill="none" stroke="#BFD3BC" strokeWidth="7" strokeLinecap="round" />
          <path d="M96 150 V250" fill="none" stroke="#BFD3BC" strokeWidth="7" strokeLinecap="round" />
        </svg>
        <ul className="jr-slots" aria-label={`${t('progress.stickers')}: ${p.stickers.length} / ${slots.length}`}>
          {slots.map((slot, i) => {
            const [x, y, size, tilt] = SLOTS[slot.name]
            const style = { left: `${(x / 390) * 100}%`, top: `${(y / 330) * 100}%`, width: `${(size / 390) * 100}%`, '--tilt': `${tilt}deg`, '--i': i } as React.CSSProperties
            return (
              <li key={slot.id} className="jr-slot" style={style}>
                <button
                  type="button"
                  className={slot.earned ? 'jr-sticker jr-sticker--earned' : 'jr-sticker'}
                  aria-label={`${title(slot.name)}, ${t(slot.earned ? 'progress.collected' : slot.gold ? 'progress.needGold' : 'progress.needFinish')}`}
                  onClick={() => setZoom(slot)}
                >
                  <img src={slot.src} alt="" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="jr-stats">
        <div className="jr-card jr-days">
          <span className="jr-days__n">{p.streak.days}</span>
          <span className="jr-days__label">{t('progress.days')}</span>
        </div>
        <div className="jr-card jr-goal">
          <GoalRing done={today} />
          <span className="jr-goal__label">{t('progress.goal')}</span>
        </div>
      </div>
      <ul className="jr-stars">
        {STORIES.map((story) => (
          <li key={story.id} className="jr-story">
            <span>{story.title[lang]}</span>
            <StarRow stars={p.stars[story.id] ?? 0} size={22} />
          </li>
        ))}
      </ul>
      {zoom && <StickerZoom slot={zoom} onClose={closeZoom} />}
    </section>
  )
}
