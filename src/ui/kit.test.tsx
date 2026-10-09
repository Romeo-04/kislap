import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup as html } from 'react-dom/server'
import { I18nProvider } from '../i18n'
import { Button, IconButton } from './Button'
import { MicButton } from './MicButton'
import { WordChip } from './WordChip'
import { StarRow } from './StarRow'
import { LangToggle } from './LangToggle'
import { OfflineStatus } from './OfflineStatus'
import { Confetti } from './Confetti'

const count = (s: string, sub: string) => s.split(sub).length - 1

describe('Button', () => {
  it('marks the variant for styling', () => {
    expect(html(<Button>Susunod</Button>)).toContain('k-btn--primary')
    expect(html(<Button variant="secondary">Ulitin</Button>)).toContain('k-btn--secondary')
  })

  it('gives icon-only buttons a label', () => {
    expect(html(<IconButton icon="back" label="Bumalik" />)).toContain('aria-label="Bumalik"')
  })
})

describe('MicButton', () => {
  it('is pressed in while recording and grows its halos with volume', () => {
    const out = html(<MicButton state="recording" level={1} label="mic" />)
    expect(out).toContain('aria-pressed="true"')
    expect(out).toContain('--mic-level:1')
  })

  it('cannot be tapped while Ningning thinks', () => {
    expect(html(<MicButton state="thinking" level={0} label="mic" />)).toContain('disabled=""')
  })
})

describe('WordChip', () => {
  it('shows its state by shape class, and a check only when correct', () => {
    expect(html(<WordChip word="pusa" status="correct" />)).toContain('k-word--correct')
    expect(count(html(<WordChip word="pusa" status="correct" />), 'k-word__check')).toBe(1)
    expect(count(html(<WordChip word="isang" status="unclear" />), 'k-word__check')).toBe(0)
    expect(html(<WordChip word="maliit" status="missed" />)).toContain('k-word--missed')
  })

  it('opens syllables joined by a middle dot', () => {
    const out = html(<WordChip word="hardin" status="missed" syllables={['har', 'din']} open />)
    expect(out).toContain('har · din')
  })

  it('keeps syllables closed until tapped', () => {
    expect(html(<WordChip word="hardin" status="missed" syllables={['har', 'din']} />)).not.toContain('har · din')
  })
})

describe('StarRow', () => {
  it('fills earned stars and says the count', () => {
    const out = html(<StarRow stars={2} />)
    expect(count(out, 'k-star--on')).toBe(2)
    expect(count(out, 'k-star--off')).toBe(1)
    expect(out).toContain('aria-label="2 / 3"')
  })

  it('arches on the Result screen', () => {
    expect(html(<StarRow stars={3} arch />)).toContain('k-stars--arch')
  })
})

describe('LangToggle', () => {
  it('names the other language', () => {
    expect(html(<I18nProvider><LangToggle /></I18nProvider>)).toContain('>English<')
  })
})

describe('OfflineStatus', () => {
  it('shows a filling bar and a rounded percent while downloading', () => {
    const out = html(<I18nProvider><OfflineStatus progress={0.624} /></I18nProvider>)
    expect(out).toContain('width:62%')
    expect(out).toContain('62%</b>')
  })

  it('shows the words, not a dot, when ready', () => {
    expect(html(<I18nProvider><OfflineStatus ready /></I18nProvider>)).toContain('Handa kahit offline')
  })
})

describe('Confetti', () => {
  it('draws the same pieces every time', () => {
    expect(html(<Confetti />)).toBe(html(<Confetti />))
    expect(count(html(<Confetti />), 'class="k-confetti__bit ')).toBe(34)
  })
})

describe('paper look (Claude Design part 2)', () => {
  it('draws earned stars with a cream edge and a darker right half, never a dark outline', () => {
    const out = html(<StarRow stars={1} />)
    expect(out).toContain('stroke="var(--edge)"')
    expect(out).toContain('k-star__shade')
    expect(out).not.toContain('stroke="var(--ink)"')
  })

  it('draws empty stars as cream with a dashed cut line, not grey', () => {
    expect(html(<StarRow stars={0} />)).toContain('stroke-dasharray="3 3"')
  })
})
