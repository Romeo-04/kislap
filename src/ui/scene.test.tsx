import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup as html } from 'react-dom/server'
import { PaperScene } from './PaperScene'
import { Wordmark } from './Wordmark'
import { readFileSync } from 'node:fs'

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

  it('carries both the day clouds and the night moon, stars and fireflies; the theme picks one', () => {
    const out = html(<PaperScene hills="low" />)
    expect(out.split('class="ps-cloud ').length - 1).toBe(3)
    expect(out).toContain('ps-moon')
    expect(out.split('ps-firefly ps-firefly--').length - 1).toBe(3)
    expect(out.split('<circle').length - 1).toBe(9) // moon (2) + seven stars
  })
})

describe('PaperScene scenery', () => {
  it('sets things on the hill line, so they stay with the hills when the page scrolls', () => {
    const out = html(<PaperScene hills="high"><i className="tree" /></PaperScene>)
    expect(out).toMatch(/class="ps-land"[^>]*>[\s\S]*class="ps-decor"><i class="tree"><\/i><\/div>/)
  })
})

describe('Wordmark', () => {
  it('can hang from a longer rope, which starts at the top of the drawing', () => {
    const out = html(<Wordmark width={320} rope={300} />)
    expect(out).toContain('viewBox="0 -360 320 560"')
    expect(out).toContain('height="560"')
    expect(out).toContain('d="M160 -360 L160 4"')
  })


  it('is an inline image named Kislap, so it uses the page font', () => {
    const out = html(<Wordmark />)
    expect(out).toContain('role="img"')
    expect(out).toContain('aria-label="Kislap"')
    expect(out).toContain('>Kislap</text>')
  })

  it('gives each wordmark its own filter id', () => {
    const out = html(<><Wordmark /><Wordmark /></>)
    const ids = [...out.matchAll(/filter id="([^"]+)"/g)].map((m) => m[1])
    expect(new Set(ids).size).toBe(2)
  })
})

describe('paper scope', () => {
  // name -> value for every custom property declared in the first block that starts at `start`
  const decls = (css: string, start: string) => {
    const from = css.indexOf(start)
    const block = css.slice(from, css.indexOf('}', from))
    return new Map([...block.matchAll(/(--[a-z-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
  }

  it('repeats the :root paper values exactly', () => {
    const css = readFileSync('src/styles/tokens.css', 'utf8')
    const root = decls(css, ':root {')
    const scope = decls(css, '.k-btn, .k-icon-btn')
    const alias: Record<string, string> = { '--fg': '--ink', '--surface': '--paper' }
    for (const [name, value] of scope) expect(root.get(alias[name] ?? name), name).toBe(value)
  })
})
