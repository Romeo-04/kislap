// On-device progress (ADR-0008). Load/save are real; recordStory/touchStreak: issue #4 (lead).
import type { ModelTier } from '../asr/tier'
import type { Stars } from '../scoring/stars'

export const PROGRESS_KEY = 'kislap.progress.v1'

export interface Progress {
  version: 1
  lang: 'fil' | 'en'
  tier?: ModelTier
  stars: Record<string, Stars>
  stickers: string[]
  practiceWords: string[]
  streak: { days: number; lastPlayed: string }
}

export function defaultProgress(): Progress {
  return { version: 1, lang: 'fil', stars: {}, stickers: [], practiceWords: [], streak: { days: 0, lastPlayed: '' } }
}

export function loadProgress(): Progress {
  try {
    const raw = globalThis.localStorage?.getItem(PROGRESS_KEY)
    if (!raw) return defaultProgress()
    const parsed = JSON.parse(raw) as Partial<Progress>
    return parsed.version === 1 ? { ...defaultProgress(), ...parsed } : defaultProgress()
  } catch {
    return defaultProgress() // bad JSON never blocks the child
  }
}

export function saveProgress(p: Progress): void {
  globalThis.localStorage?.setItem(PROGRESS_KEY, JSON.stringify(p))
}

// STUB (#4): keep best stars, sticker on every first finish (ADR-0010), bonus at 3 stars.
export function recordStory(p: Progress, storyId: string, stars: Stars): { progress: Progress; newSticker?: string } {
  const best = Math.max(p.stars[storyId] ?? 0, stars) as Stars
  return { progress: { ...p, stars: { ...p.stars, [storyId]: best } } }
}

// STUB (#4): +1 on a new day, never reset to 0.
export function touchStreak(p: Progress, _today: string): { progress: Progress; welcomeBack: boolean } {
  return { progress: p, welcomeBack: false }
}
