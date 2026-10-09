// Ningning the firefly (issue #9): a paper puppet (Claude Design part 2, Ningning.dc.html).
// Four paper wings turn on brass split pins; moods change the face, antennae, head tilt and wing angles,
// and add thought bubbles (thinking) or sparkles (celebrating).
// The glow stays live so it can follow the child's accuracy. `stick` holds Ningning up on a dowel.
import { useId } from 'react'
import { defaultGlow, type MascotMood } from '../game/mascot'
import './ningning.css'

interface Props {
  mood: MascotMood
  /** 0..1, clamped to 0.3..1 (NaN counts as 0.3); omitted = the mood's default glow */
  glow?: number
  /** width in px; the height grows with `stick` */
  size?: number
  label?: string
  /** extra frame height in SVG units; the stick runs from y=150 to the new bottom edge (0 or less = no stick) */
  stick?: number
}

interface Pose {
  up: number // upper wing angle in degrees, positive raises the tip
  lo: number // lower wing angle in degrees, positive raises the tip
  eyes: 'open' | 'happy'
  look?: [number, number]
  mouth: 'v' | 'o' | 'wave' | 'smile' | 'open'
  ant?: 'up'
  brow?: 'soft' | 'think'
  tilt?: number
}

const POSES: Record<MascotMood, Pose> = {
  idle: { up: 0, lo: 0, eyes: 'open', look: [0, 2], mouth: 'v' },
  listening: { up: 8, lo: 4, eyes: 'open', look: [1, -4], mouth: 'o', ant: 'up' },
  thinking: { up: -4, lo: -2, eyes: 'open', look: [-4, -4], mouth: 'wave', brow: 'think' },
  cheering: { up: 24, lo: 10, eyes: 'happy', mouth: 'open', ant: 'up' },
  encouraging: { up: 4, lo: 0, eyes: 'open', look: [1, 3], mouth: 'smile', brow: 'soft', tilt: -6 },
  celebrating: { up: 34, lo: -20, eyes: 'happy', mouth: 'open', ant: 'up' },
}

const WING_UP = 'M0 0 C -6 -18 -40 -34 -56 -24 C -68 -16 -60 0 -42 2 C -26 4 -10 3 0 0 Z'
const WING_LO = 'M0 0 C -10 4 -34 4 -46 14 C -56 24 -46 36 -32 30 C -18 24 -6 12 0 0 Z'
const BROWN = '#5A3A1E'

function UpperWing({ transform }: { transform: string }) {
  return (
    <g transform={transform}>
      <g className="nn-wing">
        <path d={WING_UP} fill="#E3F4FC" />
        <path d="M-6 -2 C -20 -8 -34 -14 -48 -14" fill="none" stroke="#B3DCF0" strokeWidth="3" strokeLinecap="round" />
        <path d="M-30 -6 C -40 -4 -48 -4 -54 -8" fill="none" stroke="#B3DCF0" strokeWidth="2" strokeLinecap="round" />
      </g>
    </g>
  )
}

function LowerWing({ transform }: { transform: string }) {
  return (
    <g transform={transform}>
      <g className="nn-wing nn-wing--lo">
        <path d={WING_LO} fill="#E3F4FC" />
        <path d="M-6 3 C -18 10 -28 16 -38 24" fill="none" stroke="#B3DCF0" strokeWidth="3" strokeLinecap="round" />
      </g>
    </g>
  )
}

function Mouth({ kind }: { kind: Pose['mouth'] }) {
  const line = { fill: 'none', stroke: BROWN, strokeWidth: 3.5, strokeLinecap: 'round' as const }
  switch (kind) {
    case 'o':
      return <ellipse cx="100" cy="128" rx="4.5" ry="5.5" fill="#5A2A14" />
    case 'wave':
      return <path d="M92 128 Q96 124 100 128 Q104 132 108 128" {...line} />
    case 'smile':
      return <path d="M89 123 Q100 134 111 123" {...line} />
    case 'open':
      return (
        <>
          <path d="M86 121 Q100 142 114 121 Z" fill="#5A2A14" />
          <ellipse cx="100" cy="132" rx="6" ry="3.5" fill="var(--cap)" />
        </>
      )
    default:
      return <path d="M94 125 L100 131 L106 125" {...line} strokeLinejoin="round" />
  }
}

export function Ningning({ mood, glow, size = 180, label = 'Ningning', stick: rawStick = 0 }: Props) {
  const p = POSES[mood]
  const stick = Math.max(0, rawStick || 0)
  const wanted = glow ?? defaultGlow(mood)
  const g = Number.isFinite(wanted) ? Math.max(0.3, Math.min(1, wanted)) : 0.3
  const [lx, ly] = p.look ?? [0, 0]
  // unique filter id: several Ningnings can share a page
  const cut = `nn-cut-${useId().replace(/:/g, '')}`
  const height = stick > 0 ? (size * (200 + stick)) / 200 : size
  return (
    <svg
      className="ningning"
      data-mood={mood}
      data-stick={stick > 0 || undefined}
      viewBox={`0 0 200 ${200 + stick}`}
      width={size}
      height={height}
      role="img"
      aria-label={label}
      style={{ '--nn-pivot': `100px ${150 + stick}px` } as React.CSSProperties}
    >
      <defs>
        {/* die-cut edge, a third of the handoff's (team notes): dilate 3, not 9 */}
        <filter id={cut} filterUnits="userSpaceOnUse" x="-60" y="-60" width="320" height="320">
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="d0" />
          <feGaussianBlur in="d0" stdDeviation="1" result="d1" />
          <feComponentTransfer in="d1" result="d">
            <feFuncA type="discrete" tableValues="0 1" />
          </feComponentTransfer>
          <feGaussianBlur in="d" stdDeviation="3" result="b" />
          <feOffset in="b" dy="5" result="o" />
          <feFlood floodColor="#1B3A52" floodOpacity="0.28" />
          <feComposite in2="o" operator="in" result="sh" />
          <feFlood floodColor="#FFF3D1" />
          <feComposite in2="d" operator="in" result="edge" />
          <feMerge>
            <feMergeNode in="sh" />
            <feMergeNode in="edge" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g data-part="figure">
        <g data-part="glow">
          <circle cx="100" cy="160" r="64" fill="#FFE79A" opacity={+(g * 0.45).toFixed(2)} />
          <circle cx="100" cy="160" r="40" fill="#FFD95A" opacity={+(g * 0.7).toFixed(2)} />
        </g>
        {stick > 0 && (
          <g data-part="stick">
            <rect x="95" y="150" width="10" height={stick} rx="3" fill="var(--wood)" />
            <rect x="100" y="150" width="5" height={stick} rx="2" fill="var(--wood-shade)" />
          </g>
        )}
        <g filter={`url(#${cut})`}>
          <g data-part="wings">
            <LowerWing transform={`translate(64 116) rotate(${p.lo})`} />
            <LowerWing transform={`translate(136 116) scale(-1 1) rotate(${p.lo})`} />
            <UpperWing transform={`translate(62 82) rotate(${p.up})`} />
            <UpperWing transform={`translate(138 82) scale(-1 1) rotate(${p.up})`} />
          </g>
          <g data-part="tail-light">
            <path d="M80 134 Q76 164 100 186 Q124 164 120 134 Z" fill="var(--glow)" />
            <path d="M106 136 L120 134 Q124 164 100 186 Q116 160 106 136 Z" fill="var(--glow-shade)" />
            <ellipse cx="90" cy="152" rx="5" ry="9" fill="#FFF0B8" />
          </g>
          <g data-part="antennae" fill="none" stroke={BROWN} strokeWidth="5" strokeLinecap="round">
            {p.ant === 'up' ? (
              <>
                <path d="M90 54 Q86 28 78 14 Q72 6 67 12 Q64 18 70 19" />
                <path d="M110 54 Q114 28 122 14 Q128 6 133 12 Q136 18 130 19" />
              </>
            ) : (
              <>
                <path d="M88 54 Q80 32 64 26 Q53 23 55 32 Q57 38 64 34" />
                <path d="M112 54 Q120 32 136 26 Q147 23 145 32 Q143 38 136 34" />
              </>
            )}
          </g>
          <g data-part="body" transform={p.tilt ? `rotate(${p.tilt} 100 98)` : undefined}>
            <circle cx="100" cy="98" r="48" fill="var(--leaf)" />
            <path d="M139.3 70.5 A48 48 0 0 1 72.5 137.3 A60 60 0 0 0 139.3 70.5 Z" fill="var(--leaf-shade)" />
            <path d="M60 80 Q100 60 140 80 L137 68 Q100 48 63 68 Z" fill="var(--cap)" />
            <path d="M118 62 Q130 66 137 68 L139 76 Q130 71 118 69 Z" fill="var(--cap-shade)" />
            <ellipse cx="74" cy="90" rx="9" ry="5" transform="rotate(-40 74 90)" fill="#B5E27E" />
            <ellipse cx="68" cy="122" rx="7" ry="4.5" fill="var(--cap)" opacity="0.5" />
            <ellipse cx="132" cy="122" rx="7" ry="4.5" fill="var(--cap)" opacity="0.5" />
            {p.eyes === 'open' ? (
              <g data-part="eyes">
                <circle cx="82" cy="104" r="15" fill="#FFFFFF" />
                <circle cx="118" cy="104" r="15" fill="#FFFFFF" />
                <circle cx={83 + lx} cy={104 + ly} r="9" fill="var(--ink)" />
                <circle cx={119 + lx} cy={104 + ly} r="9" fill="var(--ink)" />
                <circle cx={86 + lx} cy={100 + ly} r="3.5" fill="#FFFFFF" />
                <circle cx={122 + lx} cy={100 + ly} r="3.5" fill="#FFFFFF" />
              </g>
            ) : (
              <g data-part="eyes" fill="none" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round">
                <path d="M70 108 Q82 94 94 108" />
                <path d="M106 108 Q118 94 130 108" />
              </g>
            )}
            {p.brow === 'soft' && (
              <g fill="none" stroke={BROWN} strokeWidth="3.5" strokeLinecap="round">
                <path d="M72 84 Q82 80 92 84" />
                <path d="M108 84 Q118 80 128 84" />
              </g>
            )}
            {p.brow === 'think' && <path d="M108 84 Q118 78 128 83" fill="none" stroke={BROWN} strokeWidth="3.5" strokeLinecap="round" />}
            <g data-part="mouth">
              <Mouth kind={p.mouth} />
            </g>
          </g>
          {mood === 'thinking' && (
            <g data-part="thought" fill="var(--paper)">
              <circle className="nn-thought" cx="150" cy="46" r="4" />
              <circle className="nn-thought" cx="162" cy="31" r="6.5" />
              <circle className="nn-thought" cx="179" cy="13" r="9" />
            </g>
          )}
          {mood === 'celebrating' && (
            <g data-part="sparkles" fill="var(--glow)">
              <path d="M30 40 L33 50 L43 53 L33 56 L30 66 L27 56 L17 53 L27 50 Z" />
              <path d="M172 46 L174.5 54 L182 56.5 L174.5 59 L172 67 L169.5 59 L162 56.5 L169.5 54 Z" />
              <path d="M160 150 L162 156 L168 158 L162 160 L160 166 L158 160 L152 158 L158 156 Z" />
            </g>
          )}
        </g>
        <g data-part="pins">
          <circle cx="62" cy="82" r="6" fill="var(--brass)" />
          <circle cx="60.5" cy="80.5" r="2.5" fill="var(--brass-hi)" />
          <circle cx="138" cy="82" r="6" fill="var(--brass)" />
          <circle cx="136.5" cy="80.5" r="2.5" fill="var(--brass-hi)" />
          <circle cx="64" cy="116" r="5" fill="var(--brass)" />
          <circle cx="62.8" cy="114.8" r="2" fill="var(--brass-hi)" />
          <circle cx="136" cy="116" r="5" fill="var(--brass)" />
          <circle cx="134.8" cy="114.8" r="2" fill="var(--brass-hi)" />
        </g>
      </g>
    </svg>
  )
}
