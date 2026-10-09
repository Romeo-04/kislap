// Ningning the firefly (issue #9). Art from the Claude Design handoff (designs/Ningning.dc.html,
// assets/ningning-*.svg). Group names match the asset files; motion lives in ningning.css.
import { defaultGlow, type MascotMood } from '../game/mascot'
import './ningning.css'

interface Props {
  mood: MascotMood
  /** 0.3..1; omitted = the mood's default glow */
  glow?: number
  size?: number
  label?: string
}

const INK = '#1E2B1F'
const s = { stroke: INK, strokeWidth: 4 }

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === 'cheering' || mood === 'celebrating') {
    return (
      <g data-part="eyes" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round">
        <path d="M71 96 Q82 83 93 96" />
        <path d="M107 96 Q118 83 129 96" />
      </g>
    )
  }
  // pupils look up while listening, up-left while thinking
  const [dx, dy] = mood === 'listening' ? [1, -6] : mood === 'thinking' ? [-4, -7] : [0, 0]
  const ry = mood === 'encouraging' ? 12 : 13
  return (
    <g data-part="eyes">
      {mood === 'encouraging' && (
        <>
          <path d="M72 76 Q82 71 92 76" fill="none" {...s} strokeLinecap="round" />
          <path d="M108 76 Q118 71 128 76" fill="none" {...s} strokeLinecap="round" />
        </>
      )}
      <ellipse cx="82" cy={mood === 'encouraging' ? 95 : 94} rx="11" ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth="3" />
      <ellipse cx="118" cy={mood === 'encouraging' ? 95 : 94} rx="11" ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth="3" />
      <circle cx={83 + dx + (mood === 'encouraging' ? 1 : 0)} cy={97 + dy} r="6" fill={INK} />
      <circle cx={119 + dx + (mood === 'encouraging' ? 1 : 0)} cy={97 + dy} r="6" fill={INK} />
      {mood === 'thinking' ? (
        <path d="M108 74 Q118 68 128 74" fill="none" {...s} strokeLinecap="round" />
      ) : (
        <>
          <circle cx={85 + dx + (mood === 'encouraging' ? 1 : 0)} cy={94 + dy} r="2" fill="#FFFFFF" />
          <circle cx={121 + dx + (mood === 'encouraging' ? 1 : 0)} cy={94 + dy} r="2" fill="#FFFFFF" />
        </>
      )}
    </g>
  )
}

function Mouth({ mood }: { mood: MascotMood }) {
  switch (mood) {
    case 'listening':
      return <g data-part="mouth"><ellipse cx="100" cy="117" rx="5" ry="6" fill={INK} /></g>
    case 'thinking':
      return <g data-part="mouth"><path d="M92 117 Q96 113 100 117 Q104 121 108 117" fill="none" {...s} strokeLinecap="round" /></g>
    case 'cheering':
    case 'celebrating':
      return (
        <g data-part="mouth">
          <path d="M84 111 Q100 138 116 111 Z" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="100" cy="124" rx="7" ry="4" fill="#F07F2A" />
        </g>
      )
    case 'encouraging':
      return <g data-part="mouth"><path d="M86 113 Q100 127 114 113" fill="none" {...s} strokeLinecap="round" /></g>
    default:
      return <g data-part="mouth"><path d="M90 114 Q100 123 110 114" fill="none" {...s} strokeLinecap="round" /></g>
  }
}

export function Ningning({ mood, glow, size = 180, label = 'Ningning' }: Props) {
  const g = Math.max(0.3, Math.min(1, glow ?? defaultGlow(mood)))
  const spread = mood === 'celebrating'
  return (
    <svg className="ningning" data-mood={mood} viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={label}>
      <g data-part="figure">
        <g data-part="glow">
          <circle className="nn-halo" cx="100" cy="152" r="70" fill="#FFE27A" opacity={+(g * 0.45).toFixed(2)} />
          <circle className="nn-halo" cx="100" cy="152" r="48" fill="#FFD43B" opacity={+(g * 0.7).toFixed(2)} />
        </g>
        <g data-part="wings">
          <ellipse cx={spread ? 60 : 66} cy={spread ? 70 : 72} rx="24" ry={spread ? 38 : 36} fill="#FFFFFF" {...s} transform={spread ? 'rotate(-55 60 70)' : 'rotate(-35 66 72)'} />
          <ellipse cx={spread ? 140 : 134} cy={spread ? 70 : 72} rx="24" ry={spread ? 38 : 36} fill="#FFFFFF" {...s} transform={spread ? 'rotate(55 140 70)' : 'rotate(35 134 72)'} />
        </g>
        <g data-part="antennae" fill="none" {...s} strokeLinecap="round">
          {mood === 'listening' ? (
            <>
              <path d="M88 48 L84 12" />
              <path d="M112 48 L116 12" />
              <circle cx="84" cy="10" r="7" fill="#FFC62E" strokeWidth="3" />
              <circle cx="116" cy="10" r="7" fill="#FFC62E" strokeWidth="3" />
            </>
          ) : (
            <>
              <path d="M86 48 Q80 28 70 18" />
              <path d="M114 48 Q120 28 130 18" />
              <circle cx="69" cy="16" r="7" fill="#FFC62E" strokeWidth="3" />
              <circle cx="131" cy="16" r="7" fill="#FFC62E" strokeWidth="3" />
            </>
          )}
        </g>
        <g data-part="tail-light">
          <ellipse cx="100" cy="150" rx="36" ry="28" fill="#FFC62E" {...s} />
          <ellipse cx="88" cy="158" rx="10" ry="6" fill="#FFF3B8" />
        </g>
        <g data-part="body">
          <circle cx="100" cy="96" r="54" fill="#7CC35A" {...s} />
          <path d="M56 74 Q100 26 144 74 Q100 60 56 74 Z" fill="#F07F2A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="68" cy="112" rx="8" ry="5" fill="#F07F2A" opacity="0.55" />
          <ellipse cx="132" cy="112" rx="8" ry="5" fill="#F07F2A" opacity="0.55" />
        </g>
        <Eyes mood={mood} />
        <Mouth mood={mood} />
        {mood === 'thinking' && (
          <g data-part="thought" fill="#FFFFFF" stroke={INK} strokeWidth="3">
            <circle className="nn-thought" cx="152" cy="44" r="4" />
            <circle className="nn-thought" cx="164" cy="30" r="6" />
            <circle className="nn-thought" cx="180" cy="13" r="8" />
          </g>
        )}
      </g>
    </svg>
  )
}
