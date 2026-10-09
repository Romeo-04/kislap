import { beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup as html } from 'react-dom/server'
import { I18nProvider } from '../i18n'
import { Progress } from './Progress'
import { PROGRESS_KEY, defaultProgress } from '../game/progress'

const count = (s: string, sub: string) => s.split(sub).length - 1
const mem = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } as unknown as Storage
}
beforeEach(() => {
  globalThis.localStorage = mem()
  globalThis.sessionStorage = mem()
})
const render = () => html(<I18nProvider><Progress /></I18nProvider>)

describe('firefly jar', () => {
  it('shows every sticker: earned ones bright, the rest waiting', () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...defaultProgress(), stickers: ['sticker-story-1', 'sticker-story-1-gold'] }))
    const out = render()
    expect(out).toContain('/stickers/sticker-sampaguita.svg')
    expect(out).toContain('/stickers/sticker-kubo.svg')
    expect(out).toContain('/stickers/sticker-jeep-locked.svg')
    expect(count(out, 'jar-sticker--on')).toBe(2)
  })

  it('counts days of reading and never shows a loss', () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...defaultProgress(), streak: { days: 3, lastPlayed: '2026-10-01' } }))
    const out = render()
    expect(out).toContain('>3<')
    expect(out).toContain('araw ng pagbasa')
  })

  it('shows the welcome-back line only after a gap', () => {
    expect(render()).not.toContain('Bumalik ka!')
    sessionStorage.setItem('kislap.welcomeBack', '1')
    expect(render()).toContain('Bumalik ka!')
  })
})
