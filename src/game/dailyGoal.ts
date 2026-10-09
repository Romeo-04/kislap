// Daily goal ring (Claude Design jar screen): stories finished today, goal 2 a day.
// Its own key, so the progress schema (ADR-0008) does not change.
import { localDate } from './progress'
import type { SessionResult } from './session'

export const TODAY_KEY = 'kislap.today.v1'
export const DAILY_GOAL = 2

/** YYYY-MM-DD in the child's own time zone (the streak's own helper, so both agree on "today"). */
export const localDay = localDate

interface Today {
  date: string // YYYY-MM-DD, local
  stories: number
}

function read(): Today | undefined {
  try {
    const raw = globalThis.localStorage?.getItem(TODAY_KEY)
    return raw ? (JSON.parse(raw) as Today) : undefined
  } catch {
    return undefined
  }
}

/** Stories finished on `today`; a new day starts at 0. */
export function storiesToday(today: string): number {
  const t = read()
  return t && t.date === today && Number.isFinite(t.stories) ? t.stories : 0
}

/** Adds one story to today's count. Screens call countFinishOnce, which never counts one result twice. */
export function countStoryToday(today: string): number {
  const stories = storiesToday(today) + 1
  try {
    globalThis.localStorage?.setItem(TODAY_KEY, JSON.stringify({ date: today, stories }))
  } catch {
    // full or blocked storage: the ring just does not move
  }
  return stories
}

// StrictMode runs effects twice in development; one finished Reading session moves the ring once
const counted = new WeakSet<SessionResult>()

/** Result calls this for each finish; the same session result never counts twice. */
export function countFinishOnce(result: SessionResult, today: string): void {
  if (counted.has(result)) return
  counted.add(result)
  countStoryToday(today)
}

/** One-time "welcome back" note: Home sets it after a gap (#4), the jar shows it once. */
export const WELCOME_KEY = 'kislap.welcomeBack'

/** True while a welcome-back note is waiting for the jar. */
export function hasWelcomeBack(): boolean {
  try {
    return globalThis.sessionStorage?.getItem(WELCOME_KEY) === '1'
  } catch {
    return false
  }
}

export function markWelcomeBack(): void {
  try {
    globalThis.sessionStorage?.setItem(WELCOME_KEY, '1')
  } catch {
    // blocked storage: the jar just skips the note
  }
}

export function clearWelcomeBack(): void {
  try {
    globalThis.sessionStorage?.removeItem(WELCOME_KEY)
  } catch {
    // nothing to clear
  }
}
