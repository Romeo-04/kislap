import { describe, expect, it } from 'vitest'
import { BASELINE_MS, HEARD_MS, LOUD_ENOUGH_RMS, initialMicCheck, levelFill, litSegments, micCheckReducer, type MicCheckState } from './micCheck'

const feed = (s: MicCheckState, rms: number, from: number, to: number, step = 80) => {
  for (let t = from; t <= to; t += step) s = micCheckReducer(s, { type: 'level', rms, at: t })
  return s
}

describe('level bar', () => {
  it('puts the loud-enough line at 62% of the bar', () => {
    expect(levelFill(LOUD_ENOUGH_RMS)).toBeCloseTo(0.62)
    expect(levelFill(0)).toBe(0)
    expect(levelFill(1)).toBe(1)
  })

  it('lights 0 to 10 segments', () => {
    expect(litSegments(0)).toBe(0)
    expect(litSegments(0.5)).toBe(5)
    expect(litSegments(1)).toBe(10)
  })
})

describe('mic check', () => {
  it('listens after a quiet start', () => {
    expect(feed(initialMicCheck, 0.002, 0, BASELINE_MS + 80).phase).toBe('listening')
  })

  it('calls the room noisy when it is loud before anyone speaks', () => {
    expect(feed(initialMicCheck, 0.05, 0, BASELINE_MS + 80).phase).toBe('noisy')
  })

  it('hears the child after half a second over the line', () => {
    let s = feed(initialMicCheck, 0.002, 0, BASELINE_MS + 80)
    s = feed(s, 0.04, 1000, 1000 + HEARD_MS - 100)
    expect(s.phase).toBe('listening')
    s = feed(s, 0.04, 1000 + HEARD_MS, 1000 + HEARD_MS + 80)
    expect(s.phase).toBe('heard')
  })

  it('does not count a short blip as speech', () => {
    let s = feed(initialMicCheck, 0.002, 0, BASELINE_MS + 80)
    s = feed(s, 0.04, 1000, 1160)
    s = feed(s, 0.002, 1240, 1400)
    s = feed(s, 0.04, 1480, 1640)
    expect(s.phase).toBe('listening')
  })

  it('reports a missing or busy microphone apart from a denied one', () => {
    expect(micCheckReducer(initialMicCheck, { type: 'unavailable' }).phase).toBe('unavailable')
  })

  it('shows the picture guide when the mic is not allowed, and starts over on retry', () => {
    const denied = micCheckReducer(initialMicCheck, { type: 'denied' })
    expect(denied.phase).toBe('denied')
    expect(micCheckReducer(denied, { type: 'retry' })).toEqual(initialMicCheck)
  })
})
