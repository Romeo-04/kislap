import { StarShape } from './icons'
import './kit.css'

interface Props {
  stars: number
  /** Result screen: 76 / 100 / 76 px with the middle star raised; otherwise a flat row */
  arch?: boolean
  size?: number
}

export function StarRow({ stars, arch = false, size = 26 }: Props) {
  return (
    <span className={arch ? 'k-stars k-stars--arch' : 'k-stars'} role="img" aria-label={`${stars} / 3`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="k-stars__slot" style={{ '--i': i } as React.CSSProperties}>
          <StarShape size={arch ? (i === 1 ? 100 : 76) : size} on={i < stars} />
        </span>
      ))}
    </span>
  )
}
