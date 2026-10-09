// Icons drawn in the Claude Design UI kit. Stroke colour follows the text colour.
const ink = 'currentColor'

export function MicIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <rect x="15" y="4" width="14" height="23" rx="7" fill={ink} />
      <path d="M9 20 Q9 33 22 33 Q35 33 35 20" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
      <path d="M22 33 V40 M15 40 H29" stroke={ink} strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function BackIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <path d="M14 5 L6 13 L14 21 M6 13 H21" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function RetryIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <path d="M6 13 A8 8 0 1 0 9 6.5" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M4 3 L9 6.5 L5 11" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CheckIcon({ size = 20, color = 'var(--correct)', width = 4 }: { size?: number; color?: string; width?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12 L10 18 L20 6" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PlayIcon() {
  return (
    <svg width="28" height="32" viewBox="0 0 28 32" aria-hidden="true">
      <path d="M4 4 L24 16 L4 28 Z" fill={ink} stroke={ink} strokeWidth="5" strokeLinejoin="round" />
    </svg>
  )
}

export function GearIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="9" fill="none" stroke={ink} strokeWidth="5" strokeDasharray="3.5 3.57" />
      <circle cx="13" cy="13" r="6" fill="none" stroke={ink} strokeWidth="3" />
    </svg>
  )
}

export function JarIcon({ fireflies = true }: { fireflies?: boolean }) {
  return (
    <svg width="32" height="40" viewBox="0 0 32 40" aria-hidden="true">
      <rect x="7" y="2" width="18" height="6" rx="2" fill="var(--cap)" stroke={ink} strokeWidth="2.5" />
      <path d="M8 8 Q3 12 3 18 L3 33 Q3 38 8 38 L24 38 Q29 38 29 33 L29 18 Q29 12 24 8 Z" fill="var(--surface)" stroke={ink} strokeWidth="2.5" />
      {fireflies && (
        <g fill="var(--glow)">
          <circle cx="11" cy="26" r="3" />
          <circle cx="20" cy="31" r="3" />
          <circle cx="19" cy="20" r="3" />
        </g>
      )}
    </svg>
  )
}

export function SpeakerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill={ink} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 9 Q18.5 12 16 15 M18.5 6.5 Q23 12 18.5 17.5" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function ChevronIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M8 4 L15 11 L8 18" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StarShape({ size, on, strokeWidth = 3 }: { size: number; on: boolean; strokeWidth?: number }) {
  return (
    <svg className={on ? 'k-star k-star--on' : 'k-star k-star--off'} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <polygon
        points="24,4 30,17 44,18.5 33.5,28 36.5,42 24,35 11.5,42 14.5,28 4,18.5 18,17"
        fill={on ? 'var(--glow)' : '#FFFFFF'}
        stroke="var(--ink)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  )
}
