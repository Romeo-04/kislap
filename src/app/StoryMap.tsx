// Story map (Claude Design part 2, #10): a sandy paper path over the hills, story cards on it,
// easiest at the bottom. Ningning waits by the first story not yet finished (the first story once
// all are done). Nothing is locked.
// Desktop: the path runs left to right, easiest on the left.
import { useI18n } from '../i18n'
import { STORIES } from '../content/stories'
import { loadCustomStories } from '../content/customStories'
import { stickerArt } from '../content/stickers'
import { loadProgress } from '../game/progress'
import { Ningning } from '../ui/Ningning'
import { StarRow } from '../ui/StarRow'
import { TopBar } from '../ui/TopBar'
import { PaperScene } from '../ui/PaperScene'
import './screens.css'
import './core.css'

const TALL = 'M150 860 C 90 780, 70 720, 140 660 S 330 540, 270 460 S 60 350, 120 270 S 250 170, 210 120'
const WIDE = 'M-20 330 C 120 400, 230 160, 420 230 S 760 400, 880 220 S 1100 90, 1220 150'

function Path({ d, viewBox, className }: { d: string; viewBox: string; className: string }) {
  const line = { fill: 'none', strokeLinecap: 'round' as const, vectorEffect: 'non-scaling-stroke' as const }
  return (
    <svg className={`sm-path ${className}`} viewBox={viewBox} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} stroke="var(--edge)" strokeWidth="34" {...line} />
      <path d={d} stroke="#F3D79A" strokeWidth="27" {...line} />
      <path d={d} stroke="#E2B970" strokeWidth="4" strokeDasharray="2 16" {...line} />
    </svg>
  )
}

export function StoryMap() {
  const { t } = useI18n()
  const progress = loadProgress()
  const found = STORIES.findIndex((story) => !(story.id in progress.stars))
  const next = STORIES[found < 0 ? 0 : found].id
  // hardest first in the page, so the path climbs from the bottom
  const stops = [...STORIES].reverse()
  return (
    <section className="sm-screen paper-stage">
      <PaperScene hills="map" />
      <TopBar title={t('map.title')} />
      <div className="sm-map">
        <Path d={TALL} viewBox="0 0 390 844" className="sm-path--tall" />
        <Path d={WIDE} viewBox="0 0 1200 500" className="sm-path--wide" />
        <ol className="sm-stops">
          {stops.map((story) => {
            const stars = progress.stars[story.id] ?? 0
            const art = stickerArt(`sticker-${story.id}`, STORIES)
            return (
              <li key={story.id} className={story.id === next ? 'sm-stop sm-stop--next' : 'sm-stop'}>
                <a className="sm-card" href={`#/reading/${story.id}`} aria-label={`${story.title.fil}, ${t(`level.${story.level}`)}, ${stars} / 3`}>
                  <span className="sm-cover">{art && <img src={art.src} alt="" width={56} height={56} />}</span>
                  <span className="sm-text">
                    <span className="sm-level">{t(`level.${story.level}`)}</span>
                    {/* the title is story content: Filipino first in every UI language, English under it */}
                    <strong className="sm-title" lang="fil">{story.title.fil}</strong>
                    <span className="sm-sub" lang="en">{story.title.en}</span>
                    <StarRow stars={stars} />
                  </span>
                </a>
                {story.id === next && (
                  <span className="sm-friend">
                    <Ningning mood="idle" glow={0.75} size={120} label={t('mascot.idle')} />
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </div>
      <div className="sm-own">
        {loadCustomStories().map((story) => (
          <a key={story.id} className="sm-own__story" href={`#/reading/${story.id}`}>
            <strong lang="fil">{story.title.fil}</strong>
            <span>{t(`level.${story.level}`)}</span>
            <StarRow stars={progress.stars[story.id] ?? 0} size={18} />
          </a>
        ))}
        <a className="sm-own__add" href="#/mystory">{t('mystory.add')}</a>
      </div>
    </section>
  )
}
