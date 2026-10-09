import { describe, expect, it } from 'vitest'
import { concatChunks, resample } from './resample'

const sine = (rate: number, hz: number, seconds: number) =>
  Float32Array.from({ length: Math.round(rate * seconds) }, (_, i) => Math.sin((2 * Math.PI * hz * i) / rate))

const zeroCrossings = (x: Float32Array) => {
  let n = 0
  for (let i = 1; i < x.length; i++) if (x[i - 1] < 0 !== x[i] < 0) n++
  return n
}

describe('resample', () => {
  it('turns 1 s at 48 kHz into 1 s at 16 kHz', () => {
    expect(resample(sine(48000, 440, 1), 48000, 16000).length).toBe(16000)
  })

  it('handles 44.1 kHz input', () => {
    expect(resample(sine(44100, 440, 1), 44100, 16000).length).toBe(16000)
  })

  it('keeps the pitch of a 440 Hz tone', () => {
    const out = resample(sine(48000, 440, 1), 48000, 16000)
    expect(zeroCrossings(out)).toBeGreaterThanOrEqual(876)
    expect(zeroCrossings(out)).toBeLessThanOrEqual(884)
  })

  it('keeps a constant signal constant', () => {
    const out = resample(new Float32Array(4800).fill(0.25), 48000, 16000)
    for (const v of out) expect(v).toBeCloseTo(0.25, 5)
  })

  it('returns a copy when the rates match', () => {
    const input = sine(16000, 440, 0.1)
    const out = resample(input, 16000, 16000)
    expect(out).not.toBe(input)
    expect([...out]).toEqual([...input])
  })
})

describe('concatChunks', () => {
  it('joins chunks in order', () => {
    const out = concatChunks([Float32Array.of(1, 2), Float32Array.of(3), new Float32Array(0), Float32Array.of(4)])
    expect([...out]).toEqual([1, 2, 3, 4])
  })
})
