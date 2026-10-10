// Pronunciation clips recorded by a teammate (public/audio/words/<word>.mp3), listed in wordClips.json
// by scripts/add-word-clips.sh. They ship with the app and are precached, so Listen works offline on
// every device. A word without a clip falls back to the device's own voice (ui/speak.ts).
import clips from './wordClips.json'

const RECORDED = new Set<string>(clips as string[])

/** The clip key for a word as it appears in a story: lowercase letters and hyphens only. */
export function clipKey(word: string): string {
  return word.toLowerCase().replace(/[^\p{L}-]/gu, '').replace(/^-+|-+$/g, '')
}

export function hasClip(word: string): boolean {
  return RECORDED.has(clipKey(word))
}

export function clipUrl(word: string): string {
  return `${import.meta.env.BASE_URL}audio/words/${clipKey(word)}.mp3`
}
