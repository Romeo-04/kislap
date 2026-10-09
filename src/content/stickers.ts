// Sticker art (issue #11, Claude Design handoff "Stickers"). Progress stores ids like
// `sticker-story-1` and `sticker-story-1-gold` (#4); the art follows the story's level.
import type { Level, Story } from './stories'

export const STICKER_NAMES = ['sampaguita', 'kubo', 'alitaptap', 'kalabaw', 'jeep', 'parol'] as const
export type StickerName = (typeof STICKER_NAMES)[number]

const BY_LEVEL: Record<Level, { story: StickerName; bonus: StickerName }> = {
  easy: { story: 'sampaguita', bonus: 'kubo' },
  medium: { story: 'alitaptap', bonus: 'kalabaw' },
  hard: { story: 'jeep', bonus: 'parol' },
}

export interface StickerArt {
  name: StickerName
  src: string
  lockedSrc: string
}

export function artFor(name: StickerName): StickerArt {
  return { name, src: `/stickers/sticker-${name}.svg`, lockedSrc: `/stickers/sticker-${name}-locked.svg` }
}

export function stickerArt(id: string, stories: Story[]): StickerArt | undefined {
  const m = /^sticker-(.+?)(-gold)?$/.exec(id)
  const story = m && stories.find((s) => s.id === m[1])
  if (!story) return undefined
  const pair = BY_LEVEL[story.level]
  return artFor(m[2] ? pair.bonus : pair.story)
}
