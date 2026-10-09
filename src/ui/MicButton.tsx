import { MicIcon } from './icons'
import './kit.css'

export type MicState = 'idle' | 'recording' | 'thinking'

interface Props {
  state: MicState
  /** live mic volume 0..1; the halos grow with it while recording */
  level?: number
  label: string
  onPress?: () => void
}

export function MicButton({ state, level = 0, label, onPress }: Props) {
  const clamped = Math.min(1, Math.max(0, level))
  return (
    <button
      type="button"
      className={`k-mic k-mic--${state}`}
      aria-label={label}
      aria-pressed={state === 'recording'}
      disabled={state === 'thinking'}
      onClick={onPress}
      style={{ '--mic-level': clamped } as React.CSSProperties}
    >
      <span className="k-mic__halo k-mic__halo--outer" aria-hidden="true" />
      <span className="k-mic__halo k-mic__halo--inner" aria-hidden="true" />
      <span className="k-mic__face">
        <MicIcon />
      </span>
    </button>
  )
}
