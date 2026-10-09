import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup as html } from 'react-dom/server'
import { Ningning } from './Ningning'

describe('Ningning, paper puppet', () => {
  it('marks its mood on the root so CSS can move it', () => {
    expect(html(<Ningning mood="listening" />)).toContain('data-mood="listening"')
  })

  it('keeps the named groups, including the brass pins', () => {
    const out = html(<Ningning mood="idle" />)
    for (const part of ['glow', 'wings', 'antennae', 'tail-light', 'body', 'eyes', 'mouth', 'pins']) {
      expect(out).toContain(`data-part="${part}"`)
    }
  })

  it('turns the wings on their pins by mood', () => {
    expect(html(<Ningning mood="idle" />)).toContain('translate(62 82) rotate(0)')
    expect(html(<Ningning mood="cheering" />)).toContain('translate(62 82) rotate(24)')
    expect(html(<Ningning mood="cheering" />)).toContain('translate(64 116) rotate(10)')
    expect(html(<Ningning mood="celebrating" />)).toContain('translate(64 116) rotate(-20)')
  })

  it('raises the wings when cheering: SVG rotate turns clockwise, so a positive angle lifts a left-pointing tip', () => {
    // the upper wing tip sits at (-56, -24) from its pin; turn it by the cheering angle
    const up = (deg: number) => { const t = (deg * Math.PI) / 180; return -56 * Math.sin(t) + -24 * Math.cos(t) }
    expect(up(24)).toBeLessThan(-24)
    expect(up(34)).toBeLessThan(-24)
  })

  it('tilts its head when encouraging and shows thought bubbles only while thinking', () => {
    expect(html(<Ningning mood="encouraging" />)).toContain('rotate(-6 100 98)')
    expect(html(<Ningning mood="thinking" />)).toContain('data-part="thought"')
    expect(html(<Ningning mood="idle" />)).not.toContain('data-part="thought"')
  })

  it('uses a thinner die-cut edge than the handoff', () => {
    expect(html(<Ningning mood="idle" />)).toContain('radius="3"')
  })

  it('stands on a puppet stick when asked, and the frame grows to fit it', () => {
    const out = html(<Ningning mood="idle" stick={120} size={200} />)
    expect(out).toContain('data-part="stick"')
    expect(out).toContain('viewBox="0 0 200 320"')
    expect(out).toContain('height="320"')
    expect(out).toContain('data-stick="true"')
    expect(out).toContain('--nn-pivot:100px 270px')
    expect(html(<Ningning mood="idle" />)).not.toContain('data-part="stick"')
  })

  it('sets halo opacity to glow x 0.45 and glow x 0.7, clamped to 0.3..1', () => {
    const at = (glow: number) => html(<Ningning mood="idle" glow={glow} />)
    expect(at(1)).toContain('opacity="0.45"')
    expect(at(1)).toContain('opacity="0.7"')
    expect(at(0)).toContain('opacity="0.14"')
    expect(at(0)).toContain('opacity="0.21"')
    expect(at(2)).toContain('opacity="0.45"')
    expect(at(2)).toContain('opacity="0.7"')
  })

  it('treats a NaN glow as the dimmest glow instead of rendering NaN', () => {
    const out = html(<Ningning mood="idle" glow={Number.NaN} />)
    expect(out).not.toContain('NaN')
    expect(out).toContain('opacity="0.14"')
  })

  it('leaves the halo unblended, so it still shows on the cream page', () => {
    expect(html(<Ningning mood="idle" />)).not.toContain('mix-blend-mode')
  })

  it('gives every filter its own id', () => {
    const out = html(<><Ningning mood="idle" /><Ningning mood="idle" /></>)
    const ids = [...out.matchAll(/filter id="([^"]+)"/g)].map((m) => m[1])
    expect(new Set(ids).size).toBe(2)
  })

  it('is an image with a label', () => {
    const out = html(<Ningning mood="cheering" label="Ningning, masaya" />)
    expect(out).toContain('role="img"')
    expect(out).toContain('aria-label="Ningning, masaya"')
    expect(html(<Ningning mood="idle" />)).toContain('aria-label="Ningning"')
  })

  it('points each filter reference at its own filter id', () => {
    const out = html(<Ningning mood="idle" />)
    const id = /filter id="([^"]+)"/.exec(out)?.[1]
    expect(id).toBeTruthy()
    expect(out).toContain(`filter="url(#${id})"`)
  })

  it('uses the mood default glow when none is given', () => {
    // idle's default glow is 0.6, so this cannot pass by accident at glow 1
    const out = html(<Ningning mood="idle" />)
    expect(out).toContain('opacity="0.27"')
    expect(out).toContain('opacity="0.42"')
  })

  it('has no stick, a square frame and the body pivot when stick is 0', () => {
    const out = html(<Ningning mood="idle" stick={0} />)
    expect(out).toContain('viewBox="0 0 200 200"')
    expect(out).not.toContain('data-stick')
    expect(out).toContain('--nn-pivot:100px 150px')
  })

  it('treats a negative stick as no stick, so the tail light is never clipped', () => {
    const out = html(<Ningning mood="idle" stick={-20} />)
    expect(out).toContain('viewBox="0 0 200 200"')
    expect(out).not.toContain('data-stick')
    expect(out).not.toContain('data-part="stick"')
  })

  it('draws each mood its mouth (cheering and celebrating share the open one)', () => {
    expect(html(<Ningning mood="idle" />)).toContain('M94 125 L100 131 L106 125')
    expect(html(<Ningning mood="listening" />)).toContain('rx="4.5" ry="5.5"')
    expect(html(<Ningning mood="thinking" />)).toContain('M92 128 Q96 124')
    expect(html(<Ningning mood="encouraging" />)).toContain('M89 123 Q100 134 111 123')
    expect(html(<Ningning mood="cheering" />)).toContain('M86 121 Q100 142 114 121 Z')
    expect(html(<Ningning mood="celebrating" />)).toContain('M86 121 Q100 142 114 121 Z')
  })
})
