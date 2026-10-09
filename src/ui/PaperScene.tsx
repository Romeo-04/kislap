// The paper scene behind every screen (Claude Design part 2, PaperScene): sky, clouds, a mangrove
// treeline with a kubo, two hills with cream rims, a shade band and a light paper grain.
// Night (Gabi, [data-theme="gabi"] on <html>) shows a paper moon, pinprick stars and three soft
// fireflies instead of the clouds; CSS picks the set, so the scene always matches the theme.
// Put it inside a `.paper-stage` element (scene.css), or the page background covers it.
import './scene.css'

export type HillLine = 'map' | 'high' | 'mid' | 'low'
const HILL_TOP: Record<HillLine, string> = { map: '24%', high: '64%', mid: '72%', low: '84%' }

const CLOUD = 'M14 50 Q2 50 4 38 Q6 26 20 28 Q22 10 42 12 Q52 0 68 8 Q84 2 92 18 Q110 16 112 32 Q118 50 100 50 Z'
const CLOUD_BASE = 'M8 46 Q60 50 114 40 Q114 50 100 50 L14 50 Q6 50 8 46 Z'

function Cloud({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 120 56" className={`ps-cloud ${className}`}>
      <path d={CLOUD} fill="var(--cloud)" />
      <path d={CLOUD_BASE} fill="var(--cloud-shade)" />
    </svg>
  )
}

export function PaperScene({ hills }: { hills: HillLine }) {
  return (
    <div className="paper-scene" aria-hidden="true">
      <div className="ps-night">
          <svg viewBox="0 0 80 80" className="ps-moon">
            <circle cx="40" cy="40" r="30" fill="var(--edge)" />
            <circle cx="52" cy="34" r="26" fill="var(--sky)" />
          </svg>
          <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="ps-stars">
            <g fill="var(--edge)">
              {[[40, 40, 2], [120, 90, 1.6], [210, 30, 2.2], [300, 140, 1.6], [70, 180, 1.8], [250, 210, 1.6], [170, 150, 1.4]].map(([x, y, r]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
              ))}
            </g>
          </svg>
          <span className="ps-firefly ps-firefly--a" />
          <span className="ps-firefly ps-firefly--b" />
          <span className="ps-firefly ps-firefly--c" />
      </div>
      <div className="ps-day">
          <Cloud className="ps-cloud--a" />
          <Cloud className="ps-cloud--b" />
          <Cloud className="ps-cloud--c" />
      </div>
      <div className="ps-land" style={{ top: HILL_TOP[hills] }}>
        <svg viewBox="0 0 400 90" preserveAspectRatio="none" className="ps-treeline">
          <path
            d="M0 90 L0 50 Q15 30 30 45 Q45 20 65 40 Q80 28 95 42 L110 42 L110 30 L125 18 L140 30 L140 42 Q160 25 180 40 Q200 22 222 38 Q240 30 255 44 Q275 24 298 40 Q318 30 335 44 Q355 26 372 40 Q388 34 400 44 L400 90 Z"
            fill="var(--sky-far)"
          />
        </svg>
        <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="ps-hills">
          <path d="M0 50 Q90 -10 200 30 T400 20 L400 300 L0 300 Z" fill="var(--hill-back)" />
          <path d="M0 50 Q90 -10 200 30 T400 20" fill="none" stroke="var(--rim)" strokeWidth="5" vectorEffect="non-scaling-stroke" />
          <path d="M0 110 Q130 60 260 100 T400 84 L400 300 L0 300 Z" fill="var(--hill-front)" />
          <path d="M0 110 Q130 60 260 100 T400 84" fill="none" stroke="var(--rim)" strokeWidth="5" vectorEffect="non-scaling-stroke" />
          <path d="M0 210 Q150 180 300 200 T400 196 L400 300 L0 300 Z" fill="var(--hill-shade)" />
        </svg>
      </div>
      <div className="ps-grain" />
    </div>
  )
}
