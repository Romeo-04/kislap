import { describe, expect, it } from 'vitest'
import { starsFor } from './stars'

describe('starsFor', () => {
  it('uses the 50 / 70 / 90 thresholds', () => {
    expect(starsFor(0.49)).toBe(0)
    expect(starsFor(0.5)).toBe(1)
    expect(starsFor(0.7)).toBe(2)
    expect(starsFor(0.89)).toBe(2)
    expect(starsFor(0.9)).toBe(3)
    expect(starsFor(1)).toBe(3)
  })
})
