/* oxlint-disable react/no-children-prop -- Node-only .ts tests use createElement instead of JSX. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import fil from './fil.json'
import en from './en.json'
import { I18nProvider } from './index'
import { Reading } from '../app/Reading'
import { Progress } from '../app/Progress'
import { Home } from '../app/Home'
import { StoryMap } from '../app/StoryMap'
import { MicCheck } from '../app/MicCheck'
import { Result } from '../app/Result'
import { WordPop } from '../app/WordPop'
import { MicTest } from '../app/MicTest'
import { defaultProgress } from '../game/progress'

afterEach(() => vi.unstubAllGlobals())

describe('bilingual copy', () => {
  it('provides a nonempty string in both languages for every key', () => {
    expect(Object.keys(fil).sort()).toEqual(Object.keys(en).sort())
    for (const dictionary of [fil, en]) {
      for (const value of Object.values(dictionary)) {
        expect(typeof value).toBe('string')
        expect(value.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('keeps interpolation fields consistent across languages', () => {
    for (const key of Object.keys(fil) as Array<keyof typeof fil>) {
      expect(en[key].match(/\{\w+\}/g) ?? [], key).toEqual(fil[key].match(/\{\w+\}/g) ?? [])
    }
  })

  it('offers four distinct cheering and encouraging lines in each language', () => {
    for (const dictionary of [fil, en]) {
      for (const prefix of ['mascot.cheer', 'mascot.encourage']) {
        const lines = Object.entries(dictionary).filter(([key]) => key === prefix || key.startsWith(`${prefix}.`)).map(([, value]) => value)
        expect(new Set(lines).size).toBeGreaterThanOrEqual(4)
      }
    }
  })

  it('renders a missing-story message in the default Filipino language', () => {
    const html = renderToStaticMarkup(createElement(I18nProvider, { children: createElement(Reading, { storyId: 'missing' }) }))
    expect(html).toContain('Hindi makita ang kuwento.')
    expect(html).not.toContain('Story not found')
  })

  it('renders progress labels in Filipino instead of the scaffold English labels', () => {
    const html = renderToStaticMarkup(createElement(I18nProvider, { children: createElement(Progress) }))
    expect(html).toContain('Mga sticker')
    expect(html).toContain('araw ng pagbasa')
    expect(html).not.toContain('Streak:')
  })

  it.each(['fil', 'en'] as const)('renders all scaffold screens using the saved %s language', (lang) => {
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ ...defaultProgress(), lang }) })
    vi.stubGlobal('sessionStorage', { getItem: () => '0.7' })
    vi.stubGlobal('window', { isSecureContext: true })
    vi.stubGlobal('navigator', { mediaDevices: {}, hardwareConcurrency: 4, userAgent: 'test browser' })
    const dictionary = lang === 'fil' ? fil : en
    const cases = [
      [createElement(Home), dictionary['home.play']],
      [createElement(StoryMap), dictionary['map.title']],
      [createElement(MicCheck), dictionary['miccheck.say']],
      [createElement(Progress), dictionary['progress.days']],
      [createElement(Reading, { storyId: 'story-1' }), dictionary['mascot.idle']],
      [createElement(Result, { storyId: 'story-1' }), dictionary['result.sticker']],
      [createElement(WordPop), dictionary['wordpop.title']],
      [createElement(MicTest), dictionary['device.title']],
    ] as const
    for (const [screen, expected] of cases) {
      const html = renderToStaticMarkup(createElement(I18nProvider, { children: screen }))
      expect(html.replaceAll('&#x27;', "'")).toContain(expected)
      expect(html).not.toContain('Streak:')
      expect(html).not.toContain('Ningning: idle')
    }
  })
})
