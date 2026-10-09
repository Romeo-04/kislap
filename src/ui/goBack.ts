// back only within Kislap: a shared link opened in a tab with other history must not leave the app.
// Each entry remembers how many steps into Kislap it is (history.state.kislapDepth); hash links add
// entries with no state, and back/forward bring an entry's state back. `trail` remembers which
// screen sits at each depth, so "up" can return to a parent instead of stepping back into a child;
// each entry keeps the trail up to itself, so a reload (an app update reloads open pages) keeps it too.
const KEY = 'kislapDepth'
const TRAIL = 'kislapTrail'
let depth = 0
let replacing = false
let trail: string[] = []
const here = () => location.hash || '#/'

function mark(): void {
  history.replaceState({ ...(history.state ?? {}), [KEY]: depth, [TRAIL]: trail.slice(0, depth + 1) }, '')
}

function readDepth(): number | undefined {
  const d = (history.state as Record<string, unknown> | null)?.[KEY]
  return typeof d === 'number' ? d : undefined
}

if (typeof window !== 'undefined') {
  depth = readDepth() ?? 0
  const saved = (history.state as Record<string, unknown> | null)?.[TRAIL]
  if (Array.isArray(saved)) trail = saved.filter((h): h is string => typeof h === 'string').slice(0, depth)
  trail[depth] = here()
  mark()
  window.addEventListener('hashchange', () => {
    const known = readDepth()
    if (known !== undefined) depth = known
    else if (!replacing) depth += 1 // a replaced entry keeps its place
    replacing = false
    trail[depth] = here()
    trail.length = depth + 1
    if (known === undefined) mark()
  })
}

/** Back to where the child came from; Home when this is where Kislap was opened. */
export function goBack(): void {
  if (depth > 0) history.back()
  else location.hash = '#/'
}

/**
 * Up to a parent screen (map -> Home, story -> map). If the parent is an earlier entry in this
 * tab's Kislap history, go back to the nearest one, so Back does not step into the story just left
 * (it stays as forward history). Otherwise replace this entry with the parent.
 */
export function goUp(parent: string): void {
  if (here() === parent) return // a same-hash replace fires no hashchange and would leave the flag set
  for (let i = depth - 1; i >= 0; i--) {
    if (trail[i] === parent) return history.go(i - depth)
  }
  replacing = true
  location.replace(parent)
}
