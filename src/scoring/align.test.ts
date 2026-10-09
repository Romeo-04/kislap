import { describe, expect, it } from 'vitest'
import { align, similarity } from './align'
import { normalize } from './normalize'

describe('normalize', () => {
  it('keeps Filipino letters and merges only internal hyphens and apostrophes', () => {
    expect(normalize('  NIÑA! nag-basketball, ako’y\nmasaya.  ')).toEqual(['niña', 'nagbasketball', 'akoy', 'masaya'])
  })

  it('does not erase distinct Filipino spellings', () => {
    expect(normalize('ng nang nino niño')).toEqual(['ng', 'nang', 'nino', 'niño'])
  })

  it('returns no words for blank or punctuation-only input', () => {
    expect(normalize('  ... — !  ')).toEqual([])
  })
})

describe('similarity', () => {
  it.each([
    ['', '', 1], ['', 'bata', 0], ['bata', '', 0],
    ['bata', 'bata', 1], ['bata', 'bato', 0.75],
    ['bata', 'bta', 0.75], ['bata', 'baata', 0.8], ['bata', 'xxxx', 0],
  ])('measures character edits for %s and %s', (left, right, expected) => {
    expect(similarity(left, right)).toBeCloseTo(expected)
  })
})

describe('align', () => {
  it('keeps the skipped expected index and extra heard index in the path', () => {
    expect(align(['si', 'lila', 'ay', 'nasa', 'bahay'], ['ah', 'si', 'lila', 'nasa', 'bahay'])).toEqual([
      [null, 0], [0, 1], [1, 2], [2, null], [3, 3], [4, 4],
    ])
  })

  it('pairs fuzzy words while isolating an extra word', () => {
    expect(align(['bata', 'pusa'], ['bato', 'ah', 'puso'])).toEqual([[0, 0], [null, 1], [1, 2]])
  })

  it('emits gaps for an empty side and handles two empty sides', () => {
    expect(align(['bata', 'pusa'], [])).toEqual([[0, null], [1, null]])
    expect(align([], ['bata', 'pusa'])).toEqual([[null, 0], [null, 1]])
    expect(align([], [])).toEqual([])
  })
})
