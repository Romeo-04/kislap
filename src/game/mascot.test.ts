import { describe, expect, it } from 'vitest'
import { MOOD_HOLD_MS, defaultGlow, glowFor, moodFor, settleMood } from './mascot'

describe('moodFor (docs/uml/state.md §2)', () => {
  it('listens while the mic is on and thinks after it stops', () => {
    expect(moodFor('mic-on')).toBe('listening')
    expect(moodFor('mic-off')).toBe('thinking')
  })

  it('cheers at 70% or more and encourages below', () => {
    expect(moodFor('scored', 0.7)).toBe('cheering')
    expect(moodFor('scored', 0.69)).toBe('encouraging')
    expect(moodFor('scored', 0)).toBe('encouraging')
  })

  it('encourages on silence and celebrates a finished story', () => {
    expect(moodFor('silence')).toBe('encouraging')
    expect(moodFor('story-done')).toBe('celebrating')
  })
})

describe('glowFor', () => {
  it('is never fully dark and tops out at 1', () => {
    expect(glowFor(0)).toBeCloseTo(0.3)
    expect(glowFor(1)).toBe(1)
    expect(glowFor(-2)).toBeCloseTo(0.3)
    expect(glowFor(5)).toBe(1)
  })

  it('grows with accuracy', () => {
    expect(glowFor(0.8)).toBeGreaterThan(glowFor(0.4))
  })
})

describe('settleMood', () => {
  it('returns cheering and encouraging to idle after the hold time', () => {
    expect(settleMood('cheering')).toEqual({ next: 'idle', afterMs: MOOD_HOLD_MS })
    expect(settleMood('encouraging')).toEqual({ next: 'idle', afterMs: MOOD_HOLD_MS })
    expect(MOOD_HOLD_MS).toBe(2000)
  })

  it('keeps the other moods until an event changes them', () => {
    for (const mood of ['idle', 'listening', 'thinking', 'celebrating'] as const) {
      expect(settleMood(mood)).toBeNull()
    }
  })
})

describe('defaultGlow (Claude Design Ningning table)', () => {
  it('gives each mood its designed brightness', () => {
    expect(defaultGlow('idle')).toBe(0.6)
    expect(defaultGlow('listening')).toBe(0.75)
    expect(defaultGlow('thinking')).toBe(0.5)
    expect(defaultGlow('cheering')).toBe(0.95)
    expect(defaultGlow('encouraging')).toBe(0.55)
    expect(defaultGlow('celebrating')).toBe(1)
  })
})
