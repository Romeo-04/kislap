// Ningning the firefly (issue #9). The art is a 3D render per mood (art/build_ningning.py, from the
// Claude Design SVGs in public/mascot/); the glow halo stays live SVG so it can follow accuracy.
import { defaultGlow, type MascotMood } from '../game/mascot'
import './ningning.css'

interface Props {
  mood: MascotMood
  /** 0.3..1; omitted = the mood's default glow */
  glow?: number
  size?: number
  label?: string
}

const MOODS: MascotMood[] = ['idle', 'listening', 'thinking', 'cheering', 'encouraging', 'celebrating']
const art = (mood: MascotMood) => `/mascot/ningning-${mood}.webp`

// fetch every mood once, so a mood change never shows a blank frame
if (typeof Image !== 'undefined') for (const m of MOODS) new Image().src = art(m)

export function Ningning({ mood, glow, size = 180, label = 'Ningning' }: Props) {
  const g = Math.max(0.3, Math.min(1, glow ?? defaultGlow(mood)))
  return (
    <svg className="ningning" data-mood={mood} viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={label}>
      <g data-part="figure">
        <g data-part="glow">
          <circle className="nn-halo" cx="100" cy="152" r="70" fill="#FFE27A" opacity={+(g * 0.45).toFixed(2)} />
          <circle className="nn-halo" cx="100" cy="152" r="48" fill="#FFD43B" opacity={+(g * 0.7).toFixed(2)} />
        </g>
        {/* the render shares the SVG's 200 x 200 frame, so the halo sits under the tail light */}
        <image data-part="art" href={art(mood)} x="0" y="0" width="200" height="200" />
      </g>
    </svg>
  )
}
