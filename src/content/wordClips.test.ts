import { describe, expect, it } from 'vitest'
import { clipKey, clipUrl } from './wordClips'

describe('word clips', () => {
  it('keys a story word by its letters and hyphens', () => {
    expect(clipKey('Lila.')).toBe('lila')
    expect(clipKey('Dahan-dahan')).toBe('dahan-dahan')
    expect(clipKey('"Kaya')).toBe('kaya')
  })
  it('points at the precached recording under the app base', () => {
    expect(clipUrl('Gabi')).toBe('/audio/words/gabi.mp3')
  })
})
