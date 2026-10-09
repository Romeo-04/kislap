import { describe, expect, it } from 'vitest'
import { createSilenceDetector, isMostlySilence, rms } from './meter'

const tone = (n: number, amp: number) => Float32Array.from({ length: n }, (_, i) => amp * Math.sin(i / 5))

describe('rms', () => {
  it('is 0 for silence and for an empty clip', () => {
    expect(rms(new Float32Array(1600))).toBe(0)
    expect(rms(new Float32Array(0))).toBe(0)
  })
  it('is amp/√2 for a sine wave', () => {
    expect(rms(tone(16000, 0.5))).toBeCloseTo(0.5 / Math.SQRT2, 2)
  })
})

describe('isMostlySilence', () => {
  it('is true for near-silence and false for speech-level sound', () => {
    expect(isMostlySilence(tone(16000, 0.002))).toBe(true)
    expect(isMostlySilence(tone(16000, 0.2))).toBe(false)
  })
  it('is false when a short loud word sits inside a longer quiet clip', () => {
    const clip = new Float32Array(48000)
    clip.set(tone(8000, 0.3), 20000) // 0.5 s word in 3 s of quiet
    expect(isMostlySilence(clip)).toBe(false)
  })
})

describe('createSilenceDetector', () => {
  const opts = { threshold: 0.02, silenceMs: 1500, maxMs: 15000 }

  it('never stops before the child has started speaking', () => {
    const d = createSilenceDetector(opts)
    for (let t = 0; t <= 5000; t += 50) expect(d.push(0.001, t)).toBe('continue')
  })

  it('stops after 1.5 s of quiet that follows speech', () => {
    const d = createSilenceDetector(opts)
    d.push(0.2, 0)
    d.push(0.2, 500)
    expect(d.push(0.001, 1000)).toBe('continue')
    expect(d.push(0.001, 1950)).toBe('continue') // 1.45 s after the last loud frame
    expect(d.push(0.001, 2000)).toBe('stop') // 1.5 s after it
  })

  it('resets the quiet timer when the child speaks again', () => {
    const d = createSilenceDetector(opts)
    d.push(0.2, 0)
    d.push(0.001, 1000)
    d.push(0.2, 2000) // speaks again before 1.5 s of quiet
    expect(d.push(0.001, 3000)).toBe('continue')
    expect(d.push(0.001, 3500)).toBe('stop')
  })

  it('stops at the hard maximum even while speaking', () => {
    const d = createSilenceDetector(opts)
    expect(d.push(0.2, 14950)).toBe('continue')
    expect(d.push(0.2, 15000)).toBe('stop')
  })
})
