// Daily goal ring (Claude Design jar screen): stories finished today, 2 a day by default.
// Its own key, so the progress schema (ADR-0008) does not change.
export const TODAY_KEY = 'kislap.today.v1'
export const DAILY_GOAL = 2

/** YYYY-MM-DD in the child's own time zone. */
export const localDay = (d = new Date()) => d.toLocaleDateString('en-CA')

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

/** Call once per finished story (Result screen). */
export function countStoryToday(today: string): number {
  const stories = storiesToday(today) + 1
  try {
    globalThis.localStorage?.setItem(TODAY_KEY, JSON.stringify({ date: today, stories }))
  } catch {
    // full or blocked storage: the ring just does not move
  }
  return stories
}

/** One-time "welcome back" note: Home sets it after a gap (#4), the jar shows it once. */
export const WELCOME_KEY = 'kislap.welcomeBack'

// read in render, cleared in an effect: StrictMode runs render twice, effects clean up
export function hasWelcomeBack(): boolean {
  try {
    return globalThis.sessionStorage?.getItem(WELCOME_KEY) === '1'
  } catch {
    return false
  }
}

export function clearWelcomeBack(): void {
  try {
    globalThis.sessionStorage?.removeItem(WELCOME_KEY)
  } catch {
    // nothing to clear
  }
}
