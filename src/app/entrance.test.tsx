import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup as html } from 'react-dom/server'
import { I18nProvider } from '../i18n'
import { Home } from './Home'
import { StoryMap } from './StoryMap'
import { ReadingView } from './Reading'
import { getStory } from '../content/stories'
import { initialReading } from '../game/readingMachine'
import { markVisited, resetVisits } from '../ui/entrance'
import { savedFilipino } from '../test/lang'

savedFilipino()
beforeEach(resetVisits)

const wrap = (el: React.ReactElement) => html(<I18nProvider>{el}</I18nProvider>)
const noop = () => {}
const reading = () =>
  wrap(<ReadingView story={getStory('story-1')!} index={0} state={initialReading} words={[]} mood="idle" beat={3} level={0} onMic={noop} onNext={noop} />)

describe('entrances', () => {
  it('Home and Story map enter on their first visit only', () => {
    expect(wrap(<Home />)).toMatch(/class="hm-screen[^"]*"[^>]*data-enter/)
    expect(wrap(<StoryMap />)).toMatch(/class="sm-screen[^"]*"[^>]*data-enter/)
    markVisited('home')
    markVisited('map')
    expect(wrap(<Home />)).not.toContain('data-enter')
    expect(wrap(<StoryMap />)).not.toContain('data-enter')
  })

  it('Reading enters every time a story opens', () => {
    markVisited('reading')
    expect(reading()).toMatch(/class="rd-screen[^"]*"[^>]*data-enter/)
  })

  it("wraps Reading's Ningning, so a new mood does not replay the entrance", () => {
    expect(reading()).toMatch(/class="rd-friend"><svg class="ningning/)
  })
})

describe('entrance.css', () => {
  const css = readFileSync(join(__dirname, 'entrance.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '') // comments may say anything
  const keyframes = css.match(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g) ?? []
  const rules = css.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')

  it('animates only with translate, scale and opacity, never transform', () => {
    expect(keyframes.length).toBeGreaterThan(0)
    for (const k of keyframes) expect(k).not.toMatch(/transform\s*:/)
  })

  it('moves only when the child has not asked for reduced motion', () => {
    const outside = rules.replace(/@media \(prefers-reduced-motion: no-preference\)\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
    expect(outside).not.toMatch(/animation/)
  })

  it('leaves nothing styled once an entrance ends (backwards fill)', () => {
    for (const m of rules.matchAll(/animation:\s*([^;]+);/g)) expect(m[1]).toMatch(/\bbackwards\b/)
  })
})
