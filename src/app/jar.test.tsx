import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup as html } from 'react-dom/server'
import { I18nProvider } from '../i18n'
import { Progress, StickerZoom } from './Progress'
import { PAPER_ROUTES } from '../ui/GameShell'
import { TODAY_KEY, WELCOME_KEY, countFinishOnce, hasWelcomeBack, markWelcomeBack, storiesToday } from '../game/dailyGoal'
import { PROGRESS_KEY, localDate } from '../game/progress'
import fil from '../i18n/fil.json'

const wrap = (el: React.ReactElement) => html(<I18nProvider>{el}</I18nProvider>)
const count = (s: string, sub: string) => s.split(sub).length - 1
const mem = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) }
}
const today = localDate()
// these tests read the Filipino copy, so Filipino is saved as the UI language (English is the default)
const save = (p: object) => localStorage.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, lang: 'fil', ...p }))

beforeEach(() => {
  vi.stubGlobal('localStorage', mem())
  vi.stubGlobal('sessionStorage', mem())
  save({})
})
afterEach(() => vi.unstubAllGlobals())

describe('daily goal wiring', () => {
  it('counts one finish once, even when the effect runs twice', () => {
    const result = { storyId: 'story-1', accuracy: 1, stars: 3 as const, practiceWords: [] }
    countFinishOnce(result, today)
    countFinishOnce(result, today)
    expect(storiesToday(today)).toBe(1)
    countFinishOnce({ ...result }, today) // a second finish is a new result
    expect(storiesToday(today)).toBe(2)
  })

  it('a marked welcome back waits for the jar', () => {
    expect(hasWelcomeBack()).toBe(false)
    markWelcomeBack()
    expect(hasWelcomeBack()).toBe(true)
  })
})

describe('firefly jar', () => {
  it('is a paper screen', () => expect(PAPER_ROUTES.has('progress')).toBe(true))

  it('holds all six stickers: earned ones lit, the rest as shadows', () => {
    save({ stickers: ['sticker-story-1'] })
    const out = wrap(<Progress />)
    expect(count(out, 'class="jr-sticker')).toBe(6)
    expect(count(out, 'jr-sticker--earned')).toBe(1)
    expect(out).toContain('src="/stickers/sticker-sampaguita.svg"')
    expect(count(out, '-locked.svg" alt=""')).toBe(5) // the img, not React's preload link
  })

  it('counts days of reading and today’s stories on the ring', () => {
    save({ streak: { days: 3, lastPlayed: today } })
    localStorage.setItem(TODAY_KEY, JSON.stringify({ date: today, stories: 1 }))
    const out = wrap(<Progress />)
    expect(out).toMatch(/class="jr-days__n">3</)
    expect(out).toContain(fil['progress.days'])
    expect(out).toContain('>1/2<')
    expect(out).toContain(fil['progress.goal'])
  })

  it('lists stars per story', () => {
    save({ stars: { 'story-1': 2 } })
    const out = wrap(<Progress />)
    expect(count(out, 'class="jr-story"')).toBe(3)
    expect(out).toContain('aria-label="2 / 3"')
  })

  it('says welcome back only after a gap', () => {
    expect(wrap(<Progress />)).not.toContain(fil['progress.welcome'])
    sessionStorage.setItem(WELCOME_KEY, '1')
    expect(wrap(<Progress />)).toContain(fil['progress.welcome'])
  })

  it('shows a tapped sticker big, with its name and what earns it', () => {
    const locked = wrap(<StickerZoom slot={{ id: 'sticker-story-1-gold', name: 'kubo', src: '/stickers/sticker-kubo-locked.svg', earned: false, gold: true }} onClose={() => {}} />)
    expect(locked).toContain('<dialog')
    expect(locked).toContain('>Kubo<')
    expect(locked).toContain(fil['progress.needGold'])
    const earned = wrap(<StickerZoom slot={{ id: 'sticker-story-1', name: 'sampaguita', src: '/stickers/sticker-sampaguita.svg', earned: true, gold: false }} onClose={() => {}} />)
    expect(earned).toContain(fil['progress.collected'])
  })

  it('caps the ring at the goal and starts a new day empty', () => {
    localStorage.setItem(TODAY_KEY, JSON.stringify({ date: today, stories: 3 }))
    const full = wrap(<Progress />)
    expect(full).toContain('>2/2<')
    expect(full).not.toContain('>3/2<')
    localStorage.setItem(TODAY_KEY, JSON.stringify({ date: '2000-01-01', stories: 2 }))
    const fresh = wrap(<Progress />)
    expect(fresh).toContain('>0/2<')
    expect(fresh).not.toContain('stroke="var(--correct)"')
  })

  it('puts each story’s stars on its own row', () => {
    save({ stars: { 'story-1': 2 } })
    const rows = [...wrap(<Progress />).matchAll(/class="jr-story"><span lang="fil">[^<]*<\/span><span class="k-stars" role="img" aria-label="([^"]*)"/g)].map((m) => m[1])
    expect(rows).toEqual(['2 / 3', '0 / 3', '0 / 3'])
  })

  it('lights the gold sticker and says what each locked one needs', () => {
    save({ stickers: ['sticker-story-1-gold'] })
    const out = wrap(<Progress />)
    expect(count(out, 'jr-sticker--earned')).toBe(1)
    expect(out).toContain('src="/stickers/sticker-kubo.svg"')
    expect(out).toContain(`aria-label="Sampaguita, ${fil['progress.needFinish']}"`)
    expect(out).toContain(`aria-label="Parol, ${fil['progress.needGold']}"`)
    expect(out).toContain(`aria-label="Kubo, ${fil['progress.collected']}"`)
  })

  it('says collected for an earned gold sticker, and finish for a locked story sticker', () => {
    const gold = wrap(<StickerZoom slot={{ id: 'sticker-story-1-gold', name: 'kubo', src: '', earned: true, gold: true }} onClose={() => {}} />)
    expect(gold).toContain(fil['progress.collected'])
    expect(gold).not.toContain(fil['progress.needGold'])
    const story = wrap(<StickerZoom slot={{ id: 'sticker-story-2', name: 'alitaptap', src: '', earned: false, gold: false }} onClose={() => {}} />)
    expect(story).toContain(fil['progress.needFinish'])
  })
})
