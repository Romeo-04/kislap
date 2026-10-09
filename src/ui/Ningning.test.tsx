import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup as html } from 'react-dom/server'
import { Ningning } from './Ningning'

const MOODS = ['idle', 'listening', 'thinking', 'cheering', 'encouraging', 'celebrating'] as const

describe('Ningning', () => {
  it('marks its mood on the root so CSS can move it', () => {
    expect(html(<Ningning mood="listening" />)).toContain('data-mood="listening"')
  })

  it('shows the 3D render for each mood', () => {
    for (const mood of MOODS) {
      expect(html(<Ningning mood={mood} />)).toContain(`href="/mascot/ningning-${mood}.webp"`)
    }
  })

  it('draws the live glow behind the render', () => {
    const out = html(<Ningning mood="idle" />)
    expect(out.indexOf('data-part="glow"')).toBeLessThan(out.indexOf('data-part="art"'))
  })

  it('sets halo opacity to glow x 0.45 and glow x 0.7', () => {
    const out = html(<Ningning mood="idle" glow={1} />)
    expect(out).toContain('opacity="0.45"')
    expect(out).toContain('opacity="0.7"')
  })

  it('uses the mood default glow and never goes below 0.3', () => {
    expect(html(<Ningning mood="celebrating" />)).toContain('opacity="0.45"')
    expect(html(<Ningning mood="idle" glow={0} />)).toContain('opacity="0.14"')
  })

  it('is an image with a label', () => {
    const out = html(<Ningning mood="cheering" label="Ningning, masaya" />)
    expect(out).toContain('role="img"')
    expect(out).toContain('aria-label="Ningning, masaya"')
  })
})
