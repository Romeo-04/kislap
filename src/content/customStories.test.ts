import { describe, expect, it } from 'vitest'
import { makeStory, toSentences, MAX_SENTENCES } from './customStories'

describe('toSentences', () => {
  it('splits at sentence ends and line breaks', () => {
    expect(toSentences('Si Ana ay masaya. Naglaro siya!\nUmuwi na sila?')).toEqual(['Si Ana ay masaya.', 'Naglaro siya!', 'Umuwi na sila?'])
  })
  it('splits a very long line into readable parts', () => {
    const long = Array.from({ length: 20 }, (_, i) => `salita${i}`).join(' ')
    expect(toSentences(long).length).toBe(2)
  })
  it('drops empty and punctuation-only parts and caps the story length', () => {
    expect(toSentences('  ...  \n\n Oo.')).toEqual(['Oo.'])
    expect(toSentences(Array.from({ length: 30 }, () => 'Isa.').join(' ')).length).toBe(MAX_SENTENCES)
  })
})

describe('makeStory', () => {
  it('makes a device-only story with a custom id', () => {
    const s = makeStory('Ang Aso', 'May aso. Tumakbo ito.', 'easy', 42)!
    expect(s).toMatchObject({ id: 'custom-42', level: 'easy', custom: true, title: { fil: 'Ang Aso', en: 'Ang Aso' } })
    expect(s.sentences.map((x) => x.text)).toEqual(['May aso.', 'Tumakbo ito.'])
  })
  it('uses the first words as a title when none is given, and refuses empty text', () => {
    expect(makeStory('', 'Ang pusa ay natulog sa bahay.', 'easy', 1)!.title.fil).toBe('Ang pusa ay natulog')
    expect(makeStory('Wala', '   ', 'easy', 1)).toBeUndefined()
  })
})
