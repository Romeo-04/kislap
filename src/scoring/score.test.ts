import { describe, expect, it } from 'vitest'
import { SCORING } from './config'
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
    ['abcdefghij', 'xxcdefghij', 'correct', 1],
    ['abcde', 'abxde', 'correct', 1],
    ['abcd', 'abxd', 'unclear', 0.5],
    ['abcde', 'abxye', 'unclear', 0.5],
    ['abcd', 'abxy', 'unclear', 0.5],
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

describe('model errors never cost the child (review of #58)', () => {
  const statusOf = (expected: string, heard: string) => scoreReading(expected, heard).words.map((w) => w.status)

  it('accepts a digit or a bare number word for a linked number word', () => {
    expect(statusOf('May tatlong ibon', 'may 3 ibon')).toEqual(['correct', 'correct', 'correct'])
    expect(statusOf('May tatlong ibon', 'may tatlo ibon')).toEqual(['correct', 'correct', 'correct'])
    expect(statusOf('isang pusa', '1 pusa')).toEqual(['correct', 'correct'])
    expect(statusOf('isang pusa', 'isa pusa')).toEqual(['correct', 'correct'])
    expect(statusOf('sampung bata', '10 bata')).toEqual(['correct', 'correct'])
  })

  it('keeps near-miss credit on number words instead of dropping to zero', () => {
    const [lima] = scoreReading('Lima', 'lim').words
    expect(lima.status).toBe('unclear')
  })

  it('treats ñ and n as the same letter (Whisper often drops the tilde)', () => {
    expect(statusOf('Si Niña', 'si nina')).toEqual(['correct', 'correct'])
  })

  it('accepts a hyphenated word heard as two words', () => {
    expect(statusOf('Dahan-dahan siyang naglakad', 'dahan dahan siyang naglakad')).toEqual(['correct', 'correct', 'correct'])
    expect(statusOf('nag-basketball kami', 'nag basketball kami')).toEqual(['correct', 'correct'])
  })

  it('accepts two expected words heard as one joined word', () => {
    expect(statusOf('May story time ngayon', 'may storytime ngayon')).toEqual(['correct', 'correct', 'correct', 'correct'])
    expect(statusOf('ang reading corner', 'ang readingcorner')).toEqual(['correct', 'correct', 'correct'])
  })

  it('still marks a really skipped word as missed', () => {
    expect(statusOf('Si Lila ay masaya', 'si lila masaya')).toEqual(['correct', 'correct', 'missed', 'correct'])
  })
})

describe('cut-offs and spacing errors stay separate (review of the cut-off change)', () => {
  const statusOf = (expected: string, heard: string) => scoreReading(expected, heard).words.map((w) => w.status)

  it('counts one wrong letter in a five-letter word as correct, and in a four-letter word as unclear', () => {
    expect(statusOf('sanga', 'sana')).toEqual(['correct']) // 0.80
    expect(statusOf('bata', 'bato')).toEqual(['unclear']) // 0.75: a different word, not a slip
  })

  it('does not absorb a skipped short word into its long neighbour as a join', () => {
    // "ningningay" against "ningning" is 0.80. It must not count as a spacing error.
    expect(statusOf('Si Ningning ay nasa sanga', 'si ningning nasa sanga')).toEqual(['correct', 'correct', 'missed', 'correct', 'correct'])
    // "siningning" against "ningning" is 0.80 too.
    expect(statusOf('Si Ningning pala', 'ningning pala')).toEqual(['missed', 'correct', 'correct'])
  })

  it('still accepts a real spacing error', () => {
    expect(statusOf('May story time ngayon', 'may storytime ngayon')).toEqual(['correct', 'correct', 'correct', 'correct'])
  })

  it('keeps the spacing check at least as strict as the correct cut-off', () => {
    expect(SCORING.spacing).toBeGreaterThanOrEqual(SCORING.correct)
  })
})