import { describe, expect, it } from 'vitest'
import { pickVoice } from './speak'

const v = (lang: string, localService = true, name = lang) => ({ lang, localService, name })

describe('pickVoice', () => {
  it('prefers a local Filipino voice', () => {
    expect(pickVoice([v('en-US'), v('id-ID'), v('fil-PH')])?.lang).toBe('fil-PH')
  })
  it('accepts Tagalog, then Indonesian, as fallbacks', () => {
    expect(pickVoice([v('en-US'), v('tl-PH')])?.lang).toBe('tl-PH')
    expect(pickVoice([v('en-US'), v('id_ID')])?.lang).toBe('id_ID')
  })
  it('never uses a network voice, even a Filipino one (ADR-0007)', () => {
    expect(pickVoice([v('fil-PH', false, 'Google Filipino')])).toBeUndefined()
  })
  it('returns nothing when no suitable voice exists, so the button hides', () => {
    expect(pickVoice([v('en-US'), v('ja-JP')])).toBeUndefined()
  })
})
