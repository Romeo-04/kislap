import { describe, expect, it } from 'vitest'
import { LOOP_SECONDS, loopNotes, musicAllowed, QUIET_ROUTES } from './music'

describe('background music', () => {
  it('never plays on a screen that listens to the mic', () => {
    for (const route of ['reading', 'wordpop', 'miccheck']) {
      expect(QUIET_ROUTES.has(route)).toBe(true)
      expect(musicAllowed(route, 1)).toBe(false)
    }
  })

  it('plays elsewhere only when the volume is above zero', () => {
    expect(musicAllowed('home', 0.4)).toBe(true)
    expect(musicAllowed('map', 0)).toBe(false)
  })

  it('keeps every note inside one loop and quiet', () => {
    const notes = loopNotes()
    expect(notes.length).toBeGreaterThan(8)
    for (const n of notes) {
      expect(n.at).toBeGreaterThanOrEqual(0)
      expect(n.at + n.dur).toBeLessThanOrEqual(LOOP_SECONDS)
      expect(n.gain).toBeLessThanOrEqual(0.06)
    }
  })
})
