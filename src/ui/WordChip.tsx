import { CheckIcon } from './icons'
import './kit.css'

export type ChipStatus = 'pending' | 'correct' | 'unclear' | 'missed'

interface Props {
  word: string
  status: ChipStatus
  syllables?: string[]
  /** syllable bubble shown */
  open?: boolean
  /** the word that just revealed pops once */
  popping?: boolean
  onTap?: () => void
}

/** Text stays tinta in every state; the state is a shape (line + check, wave, dashed ring). */
export function WordChip({ word, status, syllables, open = false, popping = false, onTap }: Props) {
  const cls = `k-word k-word--${status}${popping ? ' k-word--pop' : ''}`
  const content = (
    <>
      {word}
      {status === 'correct' && (
        <span className="k-word__check">
          <CheckIcon size={18} width={4.5} />
        </span>
      )}
      {open && syllables && syllables.length > 0 && (
        <span className="k-word__syllables" role="status">
          {syllables.join(' · ')}
        </span>
      )}
    </>
  )
  if (!onTap) return <span className={cls}>{content}</span>
  return (
    <button type="button" className={`${cls} k-word--tappable`} aria-expanded={open} onClick={onTap}>
      {content}
    </button>
  )
}
