import { describe, expect, it } from 'vitest'
import { syllabify } from './syllables'
import { STORIES } from './stories'

describe('syllabify (pantig)', () => {
  it.each([
    ['bata', ['ba', 'ta']],
    ['aso', ['a', 'so']],
    ['aklat', ['ak', 'lat']],
    ['ngipin', ['ngi', 'pin']],
    ['sanga', ['sa', 'nga']],
    ['sanggol', ['sang', 'gol']],
    ['kaibigan', ['ka', 'i', 'bi', 'gan']],
    ['alitaptap', ['a', 'li', 'tap', 'tap']],
    ['kumikislap', ['ku', 'mi', 'kis', 'lap']],
    ['nagningning', ['nag', 'ning', 'ning']],
    ['eksperto', ['eks', 'per', 'to']],
    ['trabaho', ['tra', 'ba', 'ho']],
  ])('%s → %j', (word, expected) => {
    expect(syllabify(word)).toEqual(expected)
  })

  it('keeps the original capital letters', () => {
    expect(syllabify('Ningning')).toEqual(['Ning', 'ning'])
  })

  it('drops punctuation around the word', () => {
    expect(syllabify('Lila.')).toEqual(['Li', 'la'])
    expect(syllabify('"Kaya')).toEqual(['Ka', 'ya'])
  })

  it('splits each part of a hyphenated word', () => {
    expect(syllabify('Dahan-dahan')).toEqual(['Da', 'han', 'da', 'han'])
  })

  it('returns a one-syllable word as it is', () => {
    expect(syllabify('ng')).toEqual(['ng'])
    expect(syllabify('sa')).toEqual(['sa'])
  })

  it('never loses or adds letters for any word in the three stories', () => {
    for (const story of STORIES) {
      for (const sentence of story.sentences) {
        for (const word of sentence.text.split(/\s+/)) {
          const letters = word.replace(/[^\p{L}]/gu, '')
          if (!letters) continue
          expect(syllabify(word).join('')).toBe(letters)
        }
      }
    }
  })
})
