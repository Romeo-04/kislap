import { describe, expect, it } from 'vitest'
import { SOUNDS, playSound } from './sound'

describe('sounds', () => {
  it('are short and soft', () => {
    for (const [name, notes] of Object.entries(SOUNDS)) {
      const end = Math.max(...notes.map((n) => n.at + n.dur))
      expect(end, name).toBeLessThanOrEqual(0.8)
      for (const n of notes) expect(n.gain, name).toBeLessThanOrEqual(0.15)
    }
  })

  it('cover reveal, star, sticker and pop', () => {
    expect(Object.keys(SOUNDS).sort()).toEqual(['pop', 'reveal', 'star', 'sticker'])
  })

  it('stay silent when sound is off, and never throw without Web Audio', () => {
    expect(playSound('star', { sound: false })).toBe(false)
    expect(playSound('star', { sound: true })).toBe(false) // node has no AudioContext
  })
})
