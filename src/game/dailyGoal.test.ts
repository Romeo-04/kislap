import { beforeEach, describe, expect, it } from 'vitest'
import { DAILY_GOAL, TODAY_KEY, WELCOME_KEY, clearWelcomeBack, countStoryToday, hasWelcomeBack, localDay, storiesToday } from './dailyGoal'

const mem = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } as unknown as Storage
}
beforeEach(() => {
  globalThis.localStorage = mem()
  globalThis.sessionStorage = mem()
})

describe('daily goal', () => {
  it('is two stories a day', () => expect(DAILY_GOAL).toBe(2))

  it('counts stories finished today and starts over the next day', () => {
    expect(storiesToday('2026-10-09')).toBe(0)
    countStoryToday('2026-10-09')
    expect(countStoryToday('2026-10-09')).toBe(2)
    expect(storiesToday('2026-10-10')).toBe(0)
  })

  it('reads 0 from bad data instead of throwing', () => {
    localStorage.setItem(TODAY_KEY, '{nope')
    expect(storiesToday('2026-10-09')).toBe(0)
  })

  it('writes the local date as YYYY-MM-DD', () => {
    expect(localDay(new Date(2026, 9, 9, 23, 30))).toBe('2026-10-09')
  })
})

describe('welcome back', () => {
  it('shows once, then clears', () => {
    sessionStorage.setItem(WELCOME_KEY, '1')
    expect(hasWelcomeBack()).toBe(true)
    clearWelcomeBack()
    expect(hasWelcomeBack()).toBe(false)
  })
})
