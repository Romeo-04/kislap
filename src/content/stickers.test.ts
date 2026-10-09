import { describe, expect, it } from 'vitest'
import { STICKER_NAMES, stickerArt } from './stickers'
import type { Story } from './stories'

const stories: Story[] = [
  { id: 'story-1', title: { fil: 'a', en: 'a' }, level: 'easy', sentences: [] },
  { id: 'story-2', title: { fil: 'b', en: 'b' }, level: 'medium', sentences: [] },
  { id: 'story-3', title: { fil: 'c', en: 'c' }, level: 'hard', sentences: [] },
]

describe('stickerArt', () => {
  it('maps each story sticker and its 3-star bonus to the designed art by level', () => {
    expect(stickerArt('sticker-story-1', stories)?.name).toBe('sampaguita')
    expect(stickerArt('sticker-story-1-gold', stories)?.name).toBe('kubo')
    expect(stickerArt('sticker-story-2', stories)?.name).toBe('alitaptap')
    expect(stickerArt('sticker-story-2-gold', stories)?.name).toBe('kalabaw')
    expect(stickerArt('sticker-story-3', stories)?.name).toBe('jeep')
    expect(stickerArt('sticker-story-3-gold', stories)?.name).toBe('parol')
  })

  it('gives the earned and the not-yet-earned picture', () => {
    expect(stickerArt('sticker-story-3', stories)).toEqual({
      name: 'jeep',
      src: '/stickers/sticker-jeep.svg',
      lockedSrc: '/stickers/sticker-jeep-locked.svg',
    })
  })

  it('returns nothing for an unknown sticker instead of throwing', () => {
    expect(stickerArt('sticker-story-9', stories)).toBeUndefined()
    expect(stickerArt('badge', stories)).toBeUndefined()
  })

  it('has six stickers', () => {
    expect(STICKER_NAMES).toHaveLength(6)
  })
})
