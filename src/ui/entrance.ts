// Entrance animations (Home, Story map) play on a screen's first visit per app open, so Back does
// not make a child wait through them again. In memory only: a reload is a new app open.
import { useEffect, useState } from 'react'

const visited = new Set<string>()

export function isFirstVisit(screen: string): boolean {
  return !visited.has(screen)
}

export function markVisited(screen: string): void {
  visited.add(screen)
}

/** For tests. */
export function resetVisits(): void {
  visited.clear()
}

/** True while this mount is the screen's first visit. Marking waits for the effect, since StrictMode runs initializers twice. */
export function useFirstVisit(screen: string): boolean {
  const [first] = useState(() => isFirstVisit(screen))
  useEffect(() => markVisited(screen), [screen])
  return first
}
