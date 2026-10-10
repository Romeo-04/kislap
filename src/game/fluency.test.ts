import { describe, expect, it } from 'vitest'
import { speechSeconds, wcpm } from './fluency'

const clip = (silenceS: number, speechS: number, tailS: number, rate = 16_000) => {
  const pcm = new Float32Array(Math.round((silenceS + speechS + tailS) * rate))
  const start = Math.round(silenceS * rate)
  for (let i = 0; i < Math.round(speechS * rate); i++) pcm[start + i] = 0.3 * Math.sin(i / 5)
  return pcm
}

describe('speechSeconds', () => {
  it('trims leading and trailing silence', () => {
    expect(speechSeconds(clip(0.5, 2, 1.5))).toBeCloseTo(2, 1)
  })
  it('is 0 for a silent clip', () => {
    expect(speechSeconds(new Float32Array(16_000))).toBe(0)
  })
})

describe('wcpm', () => {
  it('counts correct words per minute', () => {
    expect(wcpm(6, 3)).toBe(120)
    expect(wcpm(10, 12)).toBe(50)
  })
  it('is 0 without speaking time', () => {
    expect(wcpm(5, 0)).toBe(0)
  })
})
