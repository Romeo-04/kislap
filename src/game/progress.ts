// On-device progress (ADR-0008): one versioned JSON object in localStorage. Issue #4.
import type { ModelTier } from '../asr/tier'
import type { Stars } from '../scoring/stars'

export const PROGRESS_KEY = 'kislap.progress.v1'
/** Fired on window after each save, so the header star count never shows a stale total. */
export const PROGRESS_SAVED = 'kislap:progress-saved'

export interface Progress {
  version: 1
  lang: 'fil' | 'en'
  /** set when someone picks the language; without it the UI opens in English */
  langChosen?: true
  tier?: ModelTier
  stars: Record<string, Stars>
  stickers: string[]
  practiceWords: string[]
  streak: { days: number; lastPlayed: string }
}

export function defaultProgress(): Progress {
  return { version: 1, lang: 'en', stars: {}, stickers: [], practiceWords: [], streak: { days: 0, lastPlayed: '' } }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0))]
    : []
}

function isStars(value: unknown): value is Stars {
  return value === 0 || value === 1 || value === 2 || value === 3
}

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function loadProgress(): Progress {
  try {
    const raw = globalThis.localStorage?.getItem(PROGRESS_KEY)
    if (!raw) return defaultProgress()
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) {
      console.warn('[progress] saved progress is not an object; starting fresh')
      return defaultProgress()
    }
    if (parsed.version !== 1) {
      console.warn('[progress] unsupported save version; starting fresh', parsed.version)
      return defaultProgress()
    }
    // Recover each field independently so one damaged value does not erase earned rewards.
    const stars = isRecord(parsed.stars)
      ? Object.fromEntries(Object.entries(parsed.stars).filter((entry): entry is [string, Stars] => isStars(entry[1])))
      : {}
    const streak = isRecord(parsed.streak) ? parsed.streak : {}
    // Older saves wrote the old Filipino default on every Home visit: only a real pick keeps it.
    const langChosen = parsed.langChosen === true
    const recovered: Progress = {
      version: 1,
      lang: langChosen && (parsed.lang === 'fil' || parsed.lang === 'en') ? parsed.lang : 'en',
      ...(langChosen ? { langChosen: true as const } : {}),
      ...(parsed.tier === 'small' || parsed.tier === 'large' ? { tier: parsed.tier } : {}),
      stars,
      stickers: stringList(parsed.stickers),
      practiceWords: stringList(parsed.practiceWords).slice(-MAX_PRACTICE_WORDS),
      streak: {
        days: typeof streak.days === 'number' && Number.isSafeInteger(streak.days) && streak.days >= 0 ? streak.days : 0,
        lastPlayed: isCalendarDate(streak.lastPlayed) ? streak.lastPlayed : '',
      },
    }
    // Home saves on every visit, so anything dropped here is gone for good: leave a trace.
    const dropped = {
      stars: isRecord(parsed.stars) ? Object.keys(parsed.stars).length - Object.keys(stars).length : parsed.stars === undefined ? 0 : 1,
      stickers: Array.isArray(parsed.stickers) ? parsed.stickers.length - recovered.stickers.length : parsed.stickers === undefined ? 0 : 1,
      practiceWords: Array.isArray(parsed.practiceWords)
        ? parsed.practiceWords.length - recovered.practiceWords.length
        : parsed.practiceWords === undefined ? 0 : 1,
      streakReset:
        (parsed.streak !== undefined && !isRecord(parsed.streak)) ||
        (streak.days !== undefined && streak.days !== recovered.streak.days) ||
        (streak.lastPlayed !== undefined && streak.lastPlayed !== recovered.streak.lastPlayed),
    }
    if (dropped.stars || dropped.stickers || dropped.practiceWords || dropped.streakReset) console.warn('[progress] recovered a damaged save', dropped)
    return recovered
  } catch (err) {
    console.warn('[progress] could not load saved progress; starting fresh', err)
    return defaultProgress() // bad JSON or blocked storage never blocks the child
  }
}

/** Never throws: a full or blocked storage must not stop the child from reaching the next screen. */
export function saveProgress(p: Progress): void {
  try {
    globalThis.localStorage?.setItem(PROGRESS_KEY, JSON.stringify(p))
    // Screens that show progress (the header star count) re-read it after every save.
    globalThis.dispatchEvent?.(new Event(PROGRESS_SAVED))
  } catch (err) {
    console.error('[progress] could not save', err)
  }
}

export const MAX_PRACTICE_WORDS = 20
const DAY_MS = 86_400_000

/** Keeps the best stars. Every first finish earns a Sticker, even at 0 stars (ADR-0010); 3 stars earns a gold one. */
export function recordStory(p: Progress, storyId: string, stars: Stars): { progress: Progress; newSticker?: string } {
  const best = Math.max(p.stars[storyId] ?? 0, stars) as Stars
  const stickers = [...p.stickers]
  let newSticker: string | undefined
  for (const [id, earned] of [
    [`sticker-${storyId}`, true],
    [`sticker-${storyId}-gold`, stars === 3],
  ] as const) {
    if (earned && !stickers.includes(id)) {
      stickers.push(id)
      newSticker = id // the last one is the most special: show it
    }
  }
  return { progress: { ...p, stars: { ...p.stars, [storyId]: best }, stickers }, newSticker }
}

/** Counts days played. A missed day never resets it; it earns a welcome back instead. */
export function touchStreak(p: Progress, today: string): { progress: Progress; welcomeBack: boolean } {
  const { days, lastPlayed } = p.streak
  if (lastPlayed === today) return { progress: p, welcomeBack: false }
  const gapDays = lastPlayed ? Math.round((Date.parse(today) - Date.parse(lastPlayed)) / DAY_MS) : 0
  return { progress: { ...p, streak: { days: days + 1, lastPlayed: today } }, welcomeBack: gapDays > 1 }
}

/** Saves Missed and Unclear words for Word Pop: normalized, no repeats, newest kept. */
export function addPracticeWords(p: Progress, words: string[]): Progress {
  const clean = words.map((w) => w.toLowerCase().replace(/[^\p{L}-]/gu, '')).filter(Boolean)
  const merged = [...p.practiceWords.filter((w) => !clean.includes(w)), ...clean]
  return { ...p, practiceWords: [...new Set(merged)].slice(-MAX_PRACTICE_WORDS) }
}

/** The child's local calendar day, YYYY-MM-DD (the streak follows the device clock, not UTC). */
export function localDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
