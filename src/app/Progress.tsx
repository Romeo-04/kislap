// Firefly jar (issue #12, Claude Design layer 5): every Sticker is a firefly in the jar.
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { loadProgress } from '../game/progress'
import { DAILY_GOAL, clearWelcomeBack, hasWelcomeBack, localDay, storiesToday } from '../game/dailyGoal'
import { STORIES } from '../content/stories'
import { STICKER_NAMES, artFor, stickerArt, type StickerName } from '../content/stickers'
import { TopBar } from '../ui/TopBar'
import { StarRow } from '../ui/StarRow'
import './screens.css'

// where each sticker sits in the jar (design coordinates, 390 x 330 area)
const SLOTS: Record<StickerName, { x: number; y: number; tilt: number }> = {
  sampaguita: { x: 112, y: 92, tilt: -8 },
  alitaptap: { x: 208, y: 142, tilt: 6 },
  kubo: { x: 110, y: 208, tilt: 4 },
  jeep: { x: 214, y: 76, tilt: -4 },
  kalabaw: { x: 216, y: 236, tilt: 5 },
  parol: { x: 162, y: 152, tilt: -3 },
}

function GoalRing({ done, goal }: { done: number; goal: number }) {
  const c = 2 * Math.PI * 22
  const part = Math.min(1, done / goal) * c
  return (
    <svg width="44" height="44" viewBox="0 0 56 56" className="jar-ring" aria-hidden="true">
      <circle cx="28" cy="28" r="22" fill="none" stroke="var(--bg)" strokeWidth="9" />
      {part > 0 && (
        <circle cx="28" cy="28" r="22" fill="none" stroke="var(--correct)" strokeWidth="9" strokeDasharray={`${part.toFixed(1)} ${c.toFixed(1)}`} transform="rotate(-90 28 28)" strokeLinecap="round" />
      )}
      <circle cx="28" cy="28" r="27" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="28" cy="28" r="17" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <text x="28" y="33" textAnchor="middle" fontFamily="Baloo 2" fontWeight="800" fontSize="15" fill="var(--fg)">
        {Math.min(done, goal)}/{goal}
      </text>
    </svg>
  )
}

export function Progress() {
  const { t, lang } = useI18n()
  const [progress] = useState(loadProgress)
  const [welcome] = useState(hasWelcomeBack)
  const [big, setBig] = useState<StickerName | null>(null)
  useEffect(() => clearWelcomeBack(), [])

  const earned = new Set(progress.stickers.map((id) => stickerArt(id, STORIES)?.name).filter(Boolean) as StickerName[])
  const today = storiesToday(localDay())

  return (
    <section className="jar-screen">
      <TopBar title={t('progress.title')} />
      {welcome && <p className="jar-welcome" role="status">{t('progress.welcome')}</p>}
      <div className="jar">
        <svg viewBox="0 0 390 330" className="jar-glass" aria-hidden="true">
          <rect x="120" y="14" width="150" height="34" rx="10" fill="var(--cap)" stroke="var(--ink)" strokeWidth="3" />
          <path d="M124 48 Q74 70 74 130 L74 284 Q74 318 108 318 L282 318 Q316 318 316 284 L316 130 Q316 70 266 48 Z" fill="#FFFFFF" stroke="var(--ink)" strokeWidth="4" />
          <path d="M96 120 Q96 92 120 80" fill="none" stroke="#BFD3BC" strokeWidth="7" strokeLinecap="round" />
          <path d="M96 150 V250" fill="none" stroke="#BFD3BC" strokeWidth="7" strokeLinecap="round" />
          {STICKER_NAMES.filter((n) => earned.has(n)).map((n) => (
            <circle key={n} cx={SLOTS[n].x + 38} cy={SLOTS[n].y + 38} r="46" fill="var(--glow-soft)" opacity="0.8" />
          ))}
        </svg>
        {STICKER_NAMES.map((n, i) => {
          const art = artFor(n)
          const on = earned.has(n)
          const size = on ? 76 : n === 'parol' ? 56 : 66
          const style = {
            left: `${(SLOTS[n].x / 390) * 100}%`,
            top: SLOTS[n].y,
            width: size,
            height: size,
            '--tilt': `${on ? SLOTS[n].tilt : 0}deg`,
            animationDuration: `${3 + (i % 3)}s`,
          } as React.CSSProperties
          return on ? (
            <button key={n} type="button" className="jar-sticker jar-sticker--on" style={style} aria-label={n} onClick={() => setBig(n)}>
              <img src={art.src} alt="" width={size} height={size} />
            </button>
          ) : (
            <img key={n} className="jar-sticker" src={art.lockedSrc} alt="" width={size} height={size} style={style} />
          )
        })}
      </div>
      <div className="jar-stats">
        <div className="jar-card">
          <span className="jar-days">{progress.streak.days}</span>
          <span className="jar-label">{t('progress.days')}</span>
        </div>
        <div className="jar-card jar-card--goal">
          <GoalRing done={today} goal={DAILY_GOAL} />
          <span className="jar-label jar-label--small">{t('progress.goal')}</span>
        </div>
      </div>
      <ul className="jar-stars">
        {STORIES.map((s) => (
          <li key={s.id}>
            <span>{s.title[lang]}</span>
            <StarRow stars={progress.stars[s.id] ?? 0} size={22} />
          </li>
        ))}
      </ul>
      {big && (
        <div className="jar-big" role="dialog" aria-modal="true" aria-label={big} onKeyDown={(e) => e.key === 'Escape' && setBig(null)}>
          {/* the whole picture is the close control, focused on open so a keyboard can close it */}
          <button type="button" className="jar-big__close" autoFocus aria-label={t('nav.back')} onClick={() => setBig(null)}>
            <img src={artFor(big).src} alt="" width="220" height="220" />
            <p>{big}</p>
          </button>
        </div>
      )}
    </section>
  )
}
