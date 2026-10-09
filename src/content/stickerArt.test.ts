import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dir = fileURLToPath(new URL('../../public/stickers', import.meta.url))
const files = readdirSync(dir).filter((f) => f.endsWith('.svg'))
const read = (f: string) => readFileSync(`${dir}/${f}`, 'utf8')

// relative luminance of a #rrggbb colour, 0 (black) to 1 (white)
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// every opened tag is closed in order; self-closing tags and the XML prolog are skipped
function tagsBalance(svg: string) {
  const open: string[] = []
  for (const [tag, close, name] of svg.matchAll(/<(\/?)([a-zA-Z][\w:-]*)[^>]*?>/g)) {
    if (tag.endsWith('/>')) continue
    if (!close) open.push(name)
    else if (open.pop() !== name) return false
  }
  return open.length === 0
}

// the art a locked sticker shares with its earned twin, with the locked-only parts removed
const shared = (svg: string) =>
  svg
    .replace(/<style>[^]*?<\/style>\n?/, '')
    .replace(' class="kd-locked"', '')
    .replace('url(#kd-ghost)', 'url(#kd-cut)')
    .replace(' (not yet earned)', '')

describe('sticker art (Claude Design part 2 paper look)', () => {
  it('has all twelve stickers', () => {
    expect(files).toHaveLength(12)
  })

  for (const f of files) {
    const svg = read(f)
    const locked = f.includes('locked')

    it(`${f}: is well-formed`, () => {
      expect(tagsBalance(svg)).toBe(true)
    })

    it(`${f}: no dark outlines, printed lines in the cut line colour`, () => {
      expect(svg).not.toMatch(/#1E2B1F/i)
      expect(svg).toMatch(/<g (class="kd-locked" )?filter="url\(#kd-(cut|ghost)\)" stroke="#A08566"/)
      expect(svg).not.toContain('stroke-opacity')
      for (const [, hex] of svg.matchAll(/stroke="(#[0-9A-Fa-f]{6})"/g)) expect(luminance(hex), hex).toBeGreaterThan(0.3)
    })

    it(`${f}: solid printed details in ink`, () => {
      expect(svg).not.toContain('#4A2E17')
      for (const [, hex] of svg.matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)) {
        if (luminance(hex) < 0.15) expect(hex.toUpperCase()).toBe('#3B2412')
      }
    })

    it(`${f}: a thin cream die-cut edge`, () => {
      const filter = new RegExp(`<filter id="kd-${locked ? 'ghost' : 'cut'}"(?:(?!</filter>)[^])*</filter>`).exec(svg)?.[0]
      expect(filter).toContain('radius="4"')
      expect(filter).toContain('flood-color="#FFF3D1"')
    })

    it(`${f}: every url(#id) resolves and no provenance block ships`, () => {
      for (const [, id] of svg.matchAll(/url\(#([^)]+)\)/g)) expect(svg, id).toContain(`id="${id}"`)
      expect(svg).not.toMatch(/metadata|c2pa/)
    })

    it(`${f}: ${locked ? 'cream paper with a dashed cut line, never grey' : 'die-cut with the token shadow'}`, () => {
      if (locked) {
        expect(svg).toContain('<g class="kd-locked" filter="url(#kd-ghost)"')
        expect(svg).toContain('fill:#FFF8E7!important')
        expect(svg).toContain('stroke-dasharray')
        expect(svg).not.toContain('#56634F" flood-opacity')
      } else {
        expect(svg).toContain('filter="url(#kd-cut)"')
        expect(svg).toContain('flood-color="#1B3A52" flood-opacity="0.18"')
      }
    })
  }

  for (const f of files.filter((name) => name.includes('locked'))) {
    it(`${f}: draws the same art as its earned twin`, () => {
      expect(shared(read(f))).toBe(read(f.replace('-locked', '')))
    })
  }
})
