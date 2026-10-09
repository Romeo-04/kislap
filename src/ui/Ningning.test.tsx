import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup as html } from 'react-dom/server'
import { Ningning } from './Ningning'

describe('Ningning', () => {
  it('marks its mood on the root so CSS can move it', () => {
    expect(html(<Ningning mood="listening" />)).toContain('data-mood="listening"')
  })

  it('keeps the named groups from the design assets', () => {
    const out = html(<Ningning mood="idle" />)
    for (const part of ['glow', 'wings', 'antennae', 'tail-light', 'body', 'eyes', 'mouth']) {
      expect(out).toContain(`data-part="${part}"`)
    }
  })

  it('shows the thought bubbles only while thinking', () => {
    expect(html(<Ningning mood="thinking" />)).toContain('data-part="thought"')
    expect(html(<Ningning mood="idle" />)).not.toContain('data-part="thought"')
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
