// Firefly jar (issue #12, Claude Design part 2 "Ang aking garapon"): the jar is the hero. Earned
// stickers float inside on their own glow; the ones still to come wait as cream paper outlines. Tap one to
// see it big. Below: days of reading (never "in a row"), today's goal ring, stars per story.
// Progress QR export: issue #47 (model engineer).
import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { loadProgress } from '../game/progress'
import { DAILY_GOAL, clearWelcomeBack, hasWelcomeBack, localDay, storiesToday } from '../game/dailyGoal'
import { STORIES, getStory } from '../content/stories'
import type { ReadingRecord } from '../game/fluency'
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
      <text x="28" y="33" textAnchor="middle" fill="var(--ink)">{shown}/{DAILY_GOAL}</text>
    </svg>
  )
}

/** The sticker seen big, with its name and its status: collected, or what earns it. */
export function StickerZoom({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  const { t } = useI18n()
  const dialog = useRef<HTMLDialogElement>(null)
  // a native modal: the page behind is inert, Tab stays inside, Escape closes it
  useEffect(() => {
    const box = dialog.current
    if (!box?.showModal) return
    box.showModal()
    // Escape fires cancel first: close the zoom there, right away
    const onCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    // the close event is queued: one left over from StrictMode's cleanup arrives after the reopen,
    // so only a dialog that is really shut closes the zoom
    const onClosed = () => !box.open && onClose()
    box.addEventListener('cancel', onCancel)
    box.addEventListener('close', onClosed)
    return () => {
      box.removeEventListener('cancel', onCancel)
      box.removeEventListener('close', onClosed)
      if (box.open) box.close()
    }
  }, [onClose])
  const status = slot.earned ? 'progress.collected' : slot.gold ? 'progress.needGold' : 'progress.needFinish'
  return (
    // a tap on the dim backdrop lands on the dialog itself, not on the card
    <dialog ref={dialog} className="jr-zoom" aria-labelledby="jr-zoom-name" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="jr-zoom__card">
        <img src={slot.src} alt="" width={200} height={200} />
        <h2 id="jr-zoom-name" className="jr-zoom__name">{title(slot.name)}</h2>
        <p className="jr-zoom__status">{t(status)}</p>
        <button type="button" className="k-btn k-btn--secondary" autoFocus onClick={onClose}>{t('shell.close')}</button>
      </div>
    </dialog>
  )
}

export function Progress() {
  const { t } = useI18n()
  const p = loadProgress()
  const today = storiesToday(localDay())
  // read in render, cleared in an effect: the note shows once, and StrictMode's second render still sees it
  const [welcome] = useState(hasWelcomeBack)
  useEffect(() => clearWelcomeBack(), [])
  const [zoom, setZoom] = useState<Slot>()
  // the tapped sticker, kept from the click: Safari does not focus a button on tap
  const opener = useRef<HTMLButtonElement | null>(null)
  const closeZoom = useCallback(() => setZoom(undefined), [])
  // back to that sticker once the dialog is gone (while it is modal the page behind refuses focus)
  useEffect(() => {
    if (!zoom) opener.current?.focus()
  }, [zoom])

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
                  onClick={(e) => {
                    opener.current = e.currentTarget
                    setZoom(slot)
                  }}
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
            {/* story titles are content: Filipino in every UI language */}
            <span lang="fil">{story.title.fil}</span>
            <StarRow stars={p.stars[story.id] ?? 0} size={22} />
          </li>
        ))}
      </ul>
      <ForAdults readings={p.readings ?? []} mastered={p.mastered?.length ?? 0} />
      {zoom && <StickerZoom slot={zoom} onClose={closeZoom} />}
    </section>
  )
}

/** For parents and teachers: reading speed (words correct per minute) and words read correctly. */
function ForAdults({ readings, mastered }: { readings: ReadingRecord[]; mastered: number }) {
  const { t } = useI18n()
  const last = readings[readings.length - 1]
  const best = readings.reduce((m, r) => Math.max(m, r.wcpm), 0)
  return (
    <section className="jr-card jr-adults" aria-labelledby="jr-adults-title">
      <h2 id="jr-adults-title" className="jr-adults__title">{t('adult.title')}</h2>
      {last ? (
        <>
          <p className="jr-adults__speed">
            <strong>{t('adult.wcpm').replace('{n}', String(last.wcpm))}</strong>
            <span>{t('adult.best').replace('{n}', String(best))}</span>
          </p>
          <ol className="jr-adults__list">
            {readings.slice(-5).reverse().map((r, i) => (
              <li key={i}>
                <span lang="fil">{getStory(r.storyId)?.title.fil ?? r.storyId}</span>
                <span>{r.date}</span>
                <span>{r.wcpm} · {Math.round(r.accuracy * 100)}%</span>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p>{t('adult.none')}</p>
      )}
      <p>{t('adult.mastered').replace('{n}', String(mastered))}</p>
      <p className="jr-adults__note">{t('adult.note')}</p>
    </section>
  )
}
