// "Kislap" wordmark on a hanging paper tag (Claude Design part 2, assets/wordmark-tag.svg).
// Inlined, not an <img>: an image SVG cannot use the page's Baloo 2 font.
import { useId } from 'react'
import './scene.css'

/** `rope` lengthens the twine above the tag (in drawing units), so it can run up off the top of the screen. */
export function Wordmark({ width = 250, rope = 0, className = '' }: { width?: number; rope?: number; className?: string }) {
  // unique ids, in case two wordmarks are ever on one page
  const id = useId().replace(/:/g, '')
  const lift = `wm-lift-${id}`
  const top = `wm-top-${id}`
  const text = { x: 160, y: 162, textLength: 236, lengthAdjust: 'spacingAndGlyphs' as const }
  return (
    <svg className={`wordmark ${className}`.trim()} viewBox={`0 ${-60 - rope} 320 ${260 + rope}`} width={width} height={(width * (260 + rope)) / 320} role="img" aria-label="Kislap">
      <defs>
        <filter id={lift} filterUnits="userSpaceOnUse" x="-20" y="0" width="360" height="230">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dy="7" result="o" />
          <feFlood floodColor="#1B3A52" floodOpacity="0.25" />
          <feComposite in2="o" operator="in" result="sh" />
          <feMerge>
            <feMergeNode in="sh" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={top}>
          <rect x="0" y="0" width="320" height="104" />
        </clipPath>
      </defs>
      <path d={`M160 ${-60 - rope} L160 4`} stroke="var(--wood-shade)" strokeWidth="3.5" fill="none" />
      {/* the tag tilts on its knot; the twine above stays plumb */}
      <g transform="rotate(-4 160 4)">
      <path d="M160 4 L72 90 M160 4 L248 90" stroke="var(--wood-shade)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="160" cy="4" r="7" fill="var(--brass)" />
      <circle cx="158" cy="2" r="2.5" fill="var(--brass-hi)" />
      <g filter={`url(#${lift})`}>
        <rect x="16" y="78" width="288" height="112" rx="32" fill="var(--edge)" />
        <path d="M16 168 L304 168 L304 158 Q304 190 272 190 L48 190 Q16 190 16 158 Z" fill="var(--edge-deep)" />
        <circle cx="72" cy="90" r="6" fill="var(--brass)" />
        <circle cx="70.5" cy="88.5" r="2" fill="var(--brass-hi)" />
        <circle cx="248" cy="90" r="6" fill="var(--brass)" />
        <circle cx="246.5" cy="88.5" r="2" fill="var(--brass-hi)" />
        <g fontFamily="'Baloo 2', sans-serif" fontWeight="800" fontSize="104" textAnchor="middle" strokeLinejoin="round">
          <text {...text} fill="var(--paper)" stroke="var(--paper)" strokeWidth="20">Kislap</text>
          <text {...text} fill="#C9781A" stroke="#C9781A" strokeWidth="8" transform="translate(0 7)">Kislap</text>
          <text {...text} fill="var(--glow)" stroke="var(--glow-under)" strokeWidth="7" paintOrder="stroke">Kislap</text>
          <text {...text} fill="var(--glow-soft)" clipPath={`url(#${top})`}>Kislap</text>
        </g>
      </g>
      </g>
    </svg>
  )
}
