import { describe, expect, it } from 'vitest'
import fil from './fil.json'
import en from './en.json'

describe('interface copy', () => {
  it('has the same keys in Filipino and English', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(fil).sort())
  })

  it('has no empty strings', () => {
    for (const [key, value] of [...Object.entries(fil), ...Object.entries(en)]) {
      expect(value.trim(), key).not.toBe('')
    }
  })

  it('never tells the child they were wrong (spec §20 rule 2)', () => {
    for (const [key, value] of [...Object.entries(fil), ...Object.entries(en)]) {
      expect(value, key).not.toMatch(/\b(wrong|mistake|failed|error|mali|mintis)\b/i)
    }
  })

  it('carries the Claude Design copy', () => {
    expect(fil['app.tag2']).toBe('Kislap.')
    expect(en['home.offlineReady']).toBe('Works offline')
    expect(fil['reading.silence']).toBe('Hindi kita narinig. Ulitin natin!')
    expect(en['result.lowStars']).toBe("Let's read it again for a star.")
    expect(fil['miccheck.phrase']).toBe('Kumusta, Ningning!')
  })
})
