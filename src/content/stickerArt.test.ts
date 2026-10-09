import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dir = fileURLToPath(new URL('../../public/stickers', import.meta.url))
const files = readdirSync(dir).filter((f) => f.endsWith('.svg'))

describe('sticker art (Claude Design part 2 paper look)', () => {
  it('has all twelve stickers', () => {
    expect(files).toHaveLength(12)
  })

  for (const f of files) {
    const svg = readFileSync(`${dir}/${f}`, 'utf8')
    it(`${f}: no dark ink outlines, details in soft brown`, () => {
      expect(svg).not.toContain('#1E2B1F')
      expect(svg).toContain('stroke="#8A6236" stroke-opacity="0.6"')
    })
    it(`${f}: a thin cream die-cut edge`, () => {
      expect(svg).toMatch(/<filter id="kd-cut"[^]*?radius="4"[^]*?flood-color="#FFF3D1"/)
    })
    it(`${f}: every url(#id) resolves and no provenance block ships`, () => {
      for (const [, id] of svg.matchAll(/url\(#([^)]+)\)/g)) expect(svg, id).toContain(`id="${id}"`)
      expect(svg).not.toMatch(/metadata|c2pa/)
    })
    it(`${f}: ${f.includes('locked') ? 'a soft silhouette' : 'die-cut'} filter in use`, () => {
      expect(svg).toContain(f.includes('locked') ? 'filter="url(#kd-ghost)"' : 'filter="url(#kd-cut)"')
    })
  }
})
