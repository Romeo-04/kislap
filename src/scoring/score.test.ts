import { describe, expect, it } from 'vitest'
import { scoreReading } from './score'
import { starsFor } from './stars'

describe('scoreReading', () => {
  it('preserves the story spelling and punctuation for word highlighting', () => {
    const result = scoreReading('“Tatlo,” sabi ni Niña.', '3 sabi ni niña')
    expect(result.words.map((word) => word.word)).toEqual(['“Tatlo,”', 'sabi', 'ni', 'Niña.'])
    expect(result.accuracy).toBe(1)
  })
  it('gives a perfect reading full credit', () => {
    const result = scoreReading('Si Ningning ay nasa sanga.', 'Si Ningning ay nasa sanga.')
    expect(result.words.map((word) => word.status)).toEqual(Array(5).fill('correct'))
    expect(result.accuracy).toBe(1)
    expect(starsFor(result.accuracy)).toBe(3)
  })

  it('marks a skipped word without shifting the later words', () => {
    const result = scoreReading('Si Ningning ay nasa sanga.', 'Si Ningning nasa sanga')
    expect(result.words.map((word) => word.status)).toEqual(['correct', 'correct', 'missed', 'correct', 'correct'])
    expect(result.accuracy).toBe(0.8)
  })

  it('ignores fillers before, between, and after expected words', () => {
    expect(scoreReading('Si Lila ay nasa bahay.', 'ah Si ano Lila ay nasa bahay po').accuracy).toBe(1)
  })

  it('ignores a repeated heard word', () => {
    expect(scoreReading('Si Lila ay nasa bahay.', 'Si Lila Lila ay nasa bahay').accuracy).toBe(1)
  })

  it('does not reuse one heard word for two expected occurrences', () => {
    const result = scoreReading('Lila Lila', 'Lila')
    expect(result.words.filter((word) => word.status === 'correct')).toHaveLength(1)
    expect(result.words.filter((word) => word.status === 'missed')).toHaveLength(1)
    expect(result.accuracy).toBe(0.5)
  })

  it('aligns in reading order instead of treating speech as a bag of words', () => {
    const result = scoreReading('pusa aso', 'aso pusa')
    expect(result.accuracy).toBeLessThan(1)
  })

  it('accepts a Taglish prefix with or without a hyphen', () => {
    expect(scoreReading('Nag-basketball si Ben.', 'nagbasketball si ben').accuracy).toBe(1)
  })

  it('accepts a small explicit set of common spelling variants', () => {
    expect(scoreReading('Kumusta ang favourite mong basketbol?', 'kamusta ang favorite mong basketball').accuracy).toBe(1)
  })

  it('keeps partial matches and missing words distinct in noisy heard text', () => {
    const result = scoreReading('Si Ningning ay nasa sanga.', 'ah si ningnin nasa sanga')
    expect(result.words.map((word) => word.status)).toEqual(['correct', 'correct', 'missed', 'correct', 'correct'])
    expect(result.words[1].similarity).toBeCloseTo(7 / 8)
    expect(result.words[1].heard).toBe('ningnin')
    expect(result.accuracy).toBe(0.8)
  })

  it('marks every expected word missed for an empty recording', () => {
    const result = scoreReading('Si Lila ay nasa bahay.', '')
    expect(result.words.map((word) => word.status)).toEqual(Array(5).fill('missed'))
    expect(result.accuracy).toBe(0)
    expect(result.words.every((word) => word.heard === undefined)).toBe(true)
  })

  it('gives half credit when every word is unclear', () => {
    const result = scoreReading('bata pusa', 'bato puso')
    expect(result.words.map((word) => word.status)).toEqual(['unclear', 'unclear'])
    expect(result.accuracy).toBe(0.5)
    expect(starsFor(result.accuracy)).toBe(1)
  })

  it('ignores punctuation and casing without losing Filipino letters', () => {
    const result = scoreReading('“Si NIÑA,” ay nasa bahay!', 'si niña ay nasa bahay')
    expect(result.accuracy).toBe(1)
    expect(result.words).toHaveLength(5)
    expect(result.words[1].word).toContain('NIÑA')
  })

  it('normalizes composed and decomposed letters identically', () => {
    expect(scoreReading('Niña', 'Nin\u0303a').accuracy).toBe(1)
  })

  it('treats sentence punctuation as word boundaries', () => {
    const result = scoreReading('bata,pusa', 'bata pusa')
    expect(result.words).toHaveLength(2)
    expect(result.accuracy).toBe(1)
  })

  it.each([
    ['May tatlo na ilaw.', 'may 3 na ilaw'],
    ['May 3 na ilaw.', 'may tatlo na ilaw'],
    ['isa dalawa tatlo apat lima anim pito walo siyam sampu', '1 2 3 4 5 6 7 8 9 10'],
  ])('accepts number words and digits: %s', (expected, heard) => {
    expect(scoreReading(expected, heard).accuracy).toBe(1)
  })

  it.each([
    ['abcdefghijabcdefghij', 'xbcdefghijxbcdefghij', 'correct', 1],
    ['abcdefghijabcdefghij', 'xbcdefghijxycdefghij', 'correct', 1],
    ['abcdefghij', 'xxcdefghij', 'unclear', 0.5],
    ['abcde', 'abxde', 'unclear', 0.5],
    ['abcde', 'abxye', 'unclear', 0.5],
    ['abcde', 'abxyz', 'missed', 0],
  ] as const)('classifies similarity boundaries for %s / %s', (expected, heard, status, accuracy) => {
    const result = scoreReading(expected, heard)
    expect(result.words[0].status).toBe(status)
    expect(result.accuracy).toBe(accuracy)
  })

  it('returns zero instead of NaN when there are no expected words', () => {
    expect(scoreReading(' ... ', 'hello')).toEqual({ words: [], accuracy: 0 })
  })

  it('does not count punctuation alone as an expected word', () => {
    const result = scoreReading('Lila — Ningning', 'lila ningning')
    expect(result.words).toHaveLength(2)
    expect(result.accuracy).toBe(1)
  })
})
