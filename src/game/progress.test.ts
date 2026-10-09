import { beforeEach, describe, expect, it } from 'vitest'
import {
  addPracticeWords,
  defaultProgress,
  loadProgress,
  localDate,
  PROGRESS_KEY,
  recordStory,
  saveProgress,
  touchStreak,
} from './progress'

// Minimal in-memory localStorage for Node.
const store = new Map<string, string>()
globalThis.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage

beforeEach(() => store.clear())

describe('load and save', () => {
  it('returns defaults when nothing is saved', () => {
    expect(loadProgress()).toEqual(defaultProgress())
  })
  it('returns defaults for broken JSON instead of throwing', () => {
    store.set(PROGRESS_KEY, '{not json')
    expect(loadProgress()).toEqual(defaultProgress())
  })
  it('round-trips a saved object', () => {
    const p = { ...defaultProgress(), lang: 'en' as const, stickers: ['sticker-story-1'] }
    saveProgress(p)
    expect(loadProgress()).toEqual(p)
  })
  it('fills fields missing from an older saved object', () => {
    store.set(PROGRESS_KEY, JSON.stringify({ version: 1, lang: 'en' }))
    expect(loadProgress().stickers).toEqual([])
    expect(loadProgress().lang).toBe('en')
  })
})

describe('saved progress recovery (#68)', () => {
  it('recovers null containers before gameplay consumers use them', () => {
    store.set(PROGRESS_KEY, JSON.stringify({ version: 1, stars: null, stickers: null, streak: null }))
    const loaded = loadProgress()
    expect(touchStreak(loaded, '2026-10-10').progress.streak.days).toBe(1)
    expect(recordStory(loaded, 'story-1', 2).progress.stars['story-1']).toBe(2)
  })

  it('recovers invalid practice words without blocking new words', () => {
    store.set(PROGRESS_KEY, JSON.stringify({ version: 1, practiceWords: 'bata' }))
    expect(addPracticeWords(loadProgress(), ['pusa']).practiceWords).toEqual(['pusa'])
  })

  it('rejects unsupported language and tier while retaining earned rewards', () => {
    store.set(PROGRESS_KEY, JSON.stringify({ version: 1, lang: 'xx', tier: 'cloud', stars: { 'story-1': 3 } }))
    const loaded = loadProgress()
    expect(loaded.lang).toBe('fil')
    expect(loaded.tier).toBeUndefined()
    expect(loaded.stars).toEqual({ 'story-1': 3 })
  })

  it('retains valid entries from partially damaged collections', () => {
    store.set(PROGRESS_KEY, JSON.stringify({
      version: 1, lang: 'en', tier: 'small',
      stars: { 'story-1': 3, 'story-2': 0, tooHigh: 4, negative: -1, fraction: 1.5, string: '2', empty: null },
      stickers: ['sticker-story-1', null, 7, '', 'sticker-story-1'],
      practiceWords: ['bata', {}, false, ' ', 'pusa'],
    }))
    const loaded = loadProgress()
    expect(loaded.lang).toBe('en')
    expect(loaded.tier).toBe('small')
    expect(loaded.stars).toEqual({ 'story-1': 3, 'story-2': 0 })
    expect(loaded.stickers).toEqual(['sticker-story-1'])
    expect(loaded.practiceWords).toEqual(['bata', 'pusa'])
  })

  it('preserves the earned streak count when its date is damaged', () => {
    store.set(PROGRESS_KEY, JSON.stringify({ version: 1, streak: { days: 7, lastPlayed: '2026-02-30' } }))
    const loaded = loadProgress()
    expect(loaded.streak).toEqual({ days: 7, lastPlayed: '' })
    expect(touchStreak(loaded, '2026-10-10').progress.streak.days).toBe(8)
  })

  it.each([-1, 1.5, '7', null])('recovers an invalid streak count: %s', (days) => {
    store.set(PROGRESS_KEY, JSON.stringify({ version: 1, streak: { days, lastPlayed: '2026-10-09' } }))
    expect(touchStreak(loadProgress(), '2026-10-10').progress.streak.days).toBe(1)
  })

  it('does not treat arrays as records', () => {
    store.set(PROGRESS_KEY, JSON.stringify({ version: 1, stars: [3], streak: [] }))
    expect(loadProgress()).toEqual(defaultProgress())
  })

  it('round-trips all valid fields without losing earned progress', () => {
    const progress = {
      version: 1 as const, lang: 'en' as const, tier: 'large' as const,
      stars: { 'story-1': 3 as const }, stickers: ['sticker-story-1'], practiceWords: ['bata'],
      streak: { days: 9, lastPlayed: '2024-02-29' },
    }
    saveProgress(progress)
    expect(loadProgress()).toEqual(progress)
  })
})

describe('saveProgress', () => {
  it('does not throw when storage is full or blocked', () => {
    const original = globalThis.localStorage.setItem
    globalThis.localStorage.setItem = () => {
      throw new DOMException('quota', 'QuotaExceededError')
    }
    try {
      expect(() => saveProgress(defaultProgress())).not.toThrow()
    } finally {
      globalThis.localStorage.setItem = original
    }
  })
})

describe('recordStory', () => {
  it('gives a sticker for finishing even with 0 stars (ADR-0010)', () => {
    const { progress, newSticker } = recordStory(defaultProgress(), 'story-1', 0)
    expect(newSticker).toBe('sticker-story-1')
    expect(progress.stickers).toEqual(['sticker-story-1'])
    expect(progress.stars['story-1']).toBe(0)
  })
  it('gives the finishing sticker only once', () => {
    const first = recordStory(defaultProgress(), 'story-1', 1).progress
    const again = recordStory(first, 'story-1', 1)
    expect(again.newSticker).toBeUndefined()
    expect(again.progress.stickers).toEqual(['sticker-story-1'])
  })
  it('gives a bonus sticker the first time a story reaches 3 stars', () => {
    const first = recordStory(defaultProgress(), 'story-1', 1).progress
    const gold = recordStory(first, 'story-1', 3)
    expect(gold.newSticker).toBe('sticker-story-1-gold')
    expect(gold.progress.stickers).toEqual(['sticker-story-1', 'sticker-story-1-gold'])
  })
  it('gives both stickers on a first-try 3-star finish and reports the gold one', () => {
    const { progress, newSticker } = recordStory(defaultProgress(), 'story-2', 3)
    expect(progress.stickers).toEqual(['sticker-story-2', 'sticker-story-2-gold'])
    expect(newSticker).toBe('sticker-story-2-gold')
  })
  it('keeps the best stars, never lowers them', () => {
    const best = recordStory(defaultProgress(), 'story-1', 3).progress
    expect(recordStory(best, 'story-1', 1).progress.stars['story-1']).toBe(3)
  })
  it('does not change the input object', () => {
    const p = defaultProgress()
    recordStory(p, 'story-1', 2)
    expect(p).toEqual(defaultProgress())
  })
})

describe('touchStreak', () => {
  it('starts at 1 on the first day', () => {
    const r = touchStreak(defaultProgress(), '2026-10-09')
    expect(r.progress.streak).toEqual({ days: 1, lastPlayed: '2026-10-09' })
    expect(r.welcomeBack).toBe(false)
  })
  it('does not count the same day twice', () => {
    const day1 = touchStreak(defaultProgress(), '2026-10-09').progress
    expect(touchStreak(day1, '2026-10-09').progress.streak.days).toBe(1)
  })
  it('adds a day on the next day without a welcome-back', () => {
    const day1 = touchStreak(defaultProgress(), '2026-10-09').progress
    const r = touchStreak(day1, '2026-10-10')
    expect(r.progress.streak.days).toBe(2)
    expect(r.welcomeBack).toBe(false)
  })
  it('never resets after missed days and says welcome back', () => {
    let p = touchStreak(defaultProgress(), '2026-10-01').progress
    p = touchStreak(p, '2026-10-02').progress
    const r = touchStreak(p, '2026-10-09')
    expect(r.progress.streak.days).toBe(3)
    expect(r.welcomeBack).toBe(true)
  })
})

describe('addPracticeWords', () => {
  it('normalizes, dedupes, and keeps the newest 20', () => {
    const p = addPracticeWords(defaultProgress(), ['Pusa.', 'hardin', 'pusa'])
    expect(p.practiceWords).toEqual(['pusa', 'hardin'])
    const letters = 'abcdefghijklmnopqrstuvwxy' // 25 distinct letter-only words
    const many = addPracticeWords(p, [...letters].map((c) => `salita${c}`))
    expect(many.practiceWords).toHaveLength(20)
    expect(many.practiceWords.at(-1)).toBe('salitay')
  })
})

describe('localDate', () => {
  it('formats the local calendar day as YYYY-MM-DD', () => {
    expect(localDate(new Date(2026, 9, 9, 23, 30))).toBe('2026-10-09')
    expect(localDate(new Date(2026, 0, 5, 0, 5))).toBe('2026-01-05')
  })
})
