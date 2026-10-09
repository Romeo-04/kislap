import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup as html } from 'react-dom/server'
import { PaperScene } from './PaperScene'
import { Wordmark } from './Wordmark'

describe('PaperScene', () => {
  it('puts the hill line where each screen needs it', () => {
    expect(html(<PaperScene hills="high" />)).toContain('top:64%')
    expect(html(<PaperScene hills="mid" />)).toContain('top:72%')
    expect(html(<PaperScene hills="low" />)).toContain('top:84%')
    expect(html(<PaperScene hills="map" />)).toContain('top:24%')
  })

  it('is decoration only', () => {
    expect(html(<PaperScene hills="low" />)).toContain('aria-hidden="true"')
  })

  it('shows clouds by day and the moon and stars at night', () => {
    expect(html(<PaperScene hills="low" />)).toContain('ps-cloud')
    const night = html(<PaperScene hills="low" night />)
    expect(night).toContain('ps-moon')
    expect(night).not.toContain('ps-cloud')
  })
})

describe('Wordmark', () => {
  it('is an inline image named Kislap, so it uses the page font', () => {
    const out = html(<Wordmark />)
    expect(out).toContain('role="img"')
    expect(out).toContain('aria-label="Kislap"')
    expect(out).toContain('>Kislap</text>')
  })
})
