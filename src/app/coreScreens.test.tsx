import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup as html } from 'react-dom/server'
import { I18nProvider } from '../i18n'
import { Home } from './Home'
import { StoryMap } from './StoryMap'
import { ReadingView } from './Reading'
import { ResultView } from './Result'
import { PAPER_ROUTES } from '../ui/GameShell'
import { getStory } from '../content/stories'
import { initialReading } from '../game/readingMachine'
import fil from '../i18n/fil.json'

const wrap = (el: React.ReactElement) => html(<I18nProvider>{el}</I18nProvider>)
const count = (s: string, sub: string) => s.split(sub).length - 1
const story = getStory('story-1')!
const noop = () => {}
const view = (over: Partial<React.ComponentProps<typeof ReadingView>> = {}) =>
  wrap(
    <ReadingView
      story={story}
      index={1}
      state={initialReading}
      words={[]}
      mood="idle"
      beat={0}
      level={0}
      onMic={noop}
      onNext={noop}
      {...over}
    />,
  )

describe('paper routes', () => {
  it('draws the four core screens without the candy shell', () => {
    for (const r of ['home', 'map', 'reading', 'result']) expect(PAPER_ROUTES.has(r)).toBe(true)
  })
})

describe('Home', () => {
  it('stands on the paper scene with the wordmark, Ningning on a stick and Play', () => {
    const out = wrap(<Home />)
    expect(out).toContain('paper-stage')
    expect(out).toContain('class="wordmark')
    expect(out).toContain('data-stick="true"')
    expect(out).toMatch(/href="#\/map"[^>]*>[\s\S]*Maglaro/)
  })

  it('has the language toggle, settings and the jar', () => {
    const out = wrap(<Home />)
    expect(out).toContain('class="k-lang"')
    expect(out).toContain('href="#/settings"')
    expect(out).toMatch(/href="#\/progress"[^>]*>[\s\S]*Ang aking garapon/)
  })
})

const nextIs = (id: string) => new RegExp(`sm-stop sm-stop--next"><a class="sm-card" href="#/reading/${id}"`)
const stubStars = (stars: Record<string, number>) =>
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ version: 1, stars }), setItem: () => {} })
afterEach(() => vi.unstubAllGlobals())

describe('StoryMap', () => {
  it('shows every story as a paper card, hardest at the top', () => {
    const out = wrap(<StoryMap />)
    expect(count(out, 'class="sm-card')).toBe(3)
    expect(out.indexOf('#/reading/story-3')).toBeLessThan(out.indexOf('#/reading/story-1'))
  })

  it('uses the sticker art as each cover and puts Ningning by the next story', () => {
    const out = wrap(<StoryMap />)
    expect(out).toContain('src="/stickers/sticker-sampaguita.svg"')
    expect(count(out, 'class="ningning"')).toBe(1)
    expect(out).toMatch(nextIs('story-1'))
  })

  it('moves Ningning to the first story without stars, and back to the first once all have stars', () => {
    stubStars({ 'story-1': 2 })
    expect(wrap(<StoryMap />)).toMatch(nextIs('story-2'))
    stubStars({ 'story-1': 2, 'story-2': 1, 'story-3': 3 })
    expect(wrap(<StoryMap />)).toMatch(nextIs('story-1'))
  })
})

describe('Reading', () => {
  it('shows a vine of one light per sentence, the current one marked', () => {
    const out = view()
    expect(count(out, 'class="rd-dot')).toBe(story.sentences.length)
    expect(count(out, 'rd-dot--done')).toBe(1)
    expect(count(out, 'aria-current="step"')).toBe(1)
    expect(out).toContain(`2/${story.sentences.length}`)
  })

  it('ready: the sentence in a paper card and the mic', () => {
    const out = view()
    expect(out).toContain(story.sentences[1].text)
    expect(out).toContain('k-mic--idle')
    expect(out).toContain(fil['reading.tapMic'])
  })

  it('listening and thinking: Ningning says so, the mic changes', () => {
    expect(view({ state: { ...initialReading, phase: 'listening' }, mood: 'listening' })).toContain('k-mic--recording')
    const thinking = view({ state: { ...initialReading, phase: 'thinking' }, mood: 'thinking' })
    expect(thinking).toContain('k-mic--thinking')
    expect(thinking).toContain(fil['reading.thinking'])
  })

  it('reviewed: words carry their marks, retry and next replace the mic', () => {
    const words = story.sentences[1].text.split(' ').map((word, i) => ({ word, status: i === 0 ? ('missed' as const) : ('correct' as const), similarity: i === 0 ? 0 : 1 }))
    const out = view({ state: { phase: 'reviewed', shown: words.length, total: words.length, scored: true }, words, mood: 'cheering' })
    expect(out).toContain('k-word--missed')
    expect(out).not.toContain('class="k-mic')
    expect(out).toContain(fil['reading.retry'])
    expect(out).toContain(fil['reading.next'])
  })

  it('revealing: words light up one at a time, no syllable taps yet', () => {
    const words = story.sentences[1].text.split(' ').map((word) => ({ word, status: 'correct' as const, similarity: 1 }))
    const out = view({ state: { phase: 'revealing', shown: 1, total: words.length, scored: true }, words, mood: 'thinking' })
    expect(count(out, 'k-word--correct')).toBe(1)
    expect(count(out, 'k-word--pending')).toBe(words.length - 1)
    expect(count(out, 'k-word--pop')).toBe(1)
    expect(out).not.toContain('k-word--tappable')
  })

  it('reviewed and settled: Ningning says to look at the words', () => {
    expect(view({ state: { phase: 'reviewed', shown: 0, total: 0, scored: true }, mood: 'idle' })).toContain(fil['reading.reviewed'])
  })

  it('silence: a kind notice in the bubble, the mic back, nothing marked', () => {
    const out = view({ state: { ...initialReading, notice: 'reading.silence' }, mood: 'encouraging' })
    expect(out).toContain(`role="status"><p class="rd-bubble">${fil['reading.silence']}`)
    expect(out).toContain('k-mic--idle')
    expect(out).not.toContain('k-word--')
  })

  it('offers skip only when the model cannot run', () => {
    expect(view()).not.toContain(fil['reading.skip'])
    expect(view({ state: { ...initialReading, canSkip: true, notice: 'reading.modelUnavailable' } })).toContain(fil['reading.skip'])
    for (const phase of ['listening', 'thinking'] as const)
      expect(view({ state: { ...initialReading, phase, canSkip: true } })).not.toContain(fil['reading.skip'])
  })

  it('keeps the privacy meter', () => {
    expect(view()).toContain('privacy-meter')
  })
})

describe('Result', () => {
  it('three stars: the sticker and the bonus, more stories is the yellow button', () => {
    const out = wrap(<ResultView storyId="story-1" stars={3} newSticker="sticker-story-1-gold" />)
    expect(out).toContain('src="/stickers/sticker-sampaguita.svg"')
    expect(out).toContain('src="/stickers/sticker-kubo.svg"')
    expect(out).toContain(fil['result.bonus'])
    expect(out).toMatch(/k-btn--primary[^"]*" href="#\/map"/)
    expect(out).toMatch(/k-btn--secondary[^"]*" href="#\/reading\/story-1"/)
  })

  it('zero stars is still a win: the sticker stays, try again is the yellow button', () => {
    const out = wrap(<ResultView storyId="story-1" stars={0} newSticker="sticker-story-1" />)
    expect(out).toContain('src="/stickers/sticker-sampaguita.svg"')
    expect(out).not.toContain('sticker-kubo')
    expect(out).toContain(fil['result.lowStars'])
    expect(out).toContain('k-confetti')
    expect(out).toMatch(/k-btn--primary[^"]*" href="#\/reading\/story-1"/)
  })

  it('one or two stars: more stories stays yellow, no bonus, no try-again line', () => {
    for (const stars of [1, 2] as const) {
      const out = wrap(<ResultView storyId="story-1" stars={stars} />)
      expect(out).toMatch(/k-btn--primary[^"]*" href="#\/map"/)
      expect(out).not.toContain(fil['result.lowStars'])
      expect(out).not.toContain('sticker-kubo')
    }
  })

  it('names the new sticker, and shows no card on a replay with nothing new', () => {
    const first = wrap(<ResultView storyId="story-1" stars={2} newSticker="sticker-story-1" />)
    expect(first).toContain('data-sticker="sticker-story-1"')
    expect(first).toContain(fil['result.sticker'])
    expect(first).not.toContain(fil['result.bonus'])
    const replay = wrap(<ResultView storyId="story-1" stars={2} />)
    expect(replay).not.toContain('rs-card')
    expect(replay).not.toContain('data-sticker')
  })
})
