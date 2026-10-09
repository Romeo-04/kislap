// back only within Kislap: a shared link opened in a tab with other history must not leave the app.
// Each entry remembers how many steps into Kislap it is (history.state.kislapDepth); hash links add
// entries with no state, and back/forward bring an entry's state back. `trail` remembers which
// screen sits at each depth, so "up" can return to a parent instead of stepping back into a child.
const KEY = 'kislapDepth'
let depth = 0
let replacing = false
const trail: string[] = []
const here = () => location.hash || '#/'

function readDepth(): number | undefined {
  const d = (history.state as Record<string, unknown> | null)?.[KEY]
  return typeof d === 'number' ? d : undefined
}

if (typeof window !== 'undefined') {
  depth = readDepth() ?? 0
  history.replaceState({ ...(history.state ?? {}), [KEY]: depth }, '')
  trail[depth] = here()
  window.addEventListener('hashchange', () => {
    const known = readDepth()
    if (known !== undefined) depth = known
    else {
      if (!replacing) depth += 1 // a replaced entry keeps its place
      history.replaceState({ ...(history.state ?? {}), [KEY]: depth }, '')
    }
    replacing = false
    trail[depth] = here()
    trail.length = depth + 1
  })
}

/** Back to where the child came from; Home when this is where Kislap was opened. */
export function goBack(): void {
  if (depth > 0) history.back()
  else location.hash = '#/'
}

/**
 * Up to a parent screen (map -> Home, story -> map). If the child came through that screen, go
 * back to its entry, so Back never walks into the story just left; otherwise swap this entry for it.
 */
export function goUp(parent: string): void {
  for (let i = depth - 1; i >= 0; i--) {
    if (trail[i] === parent) return history.go(i - depth)
  }
  replacing = true
  location.replace(parent)
}
