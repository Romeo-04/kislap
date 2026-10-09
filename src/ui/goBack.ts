// back only within Kislap: a shared link opened in a tab with other history must not leave the app.
// Each entry remembers how many steps into Kislap it is (history.state.kislapDepth); hash links add
// entries with no state, and back/forward bring an entry's state back.
const KEY = 'kislapDepth'
let depth = 0

function readDepth(): number | undefined {
  const d = (history.state as Record<string, unknown> | null)?.[KEY]
  return typeof d === 'number' ? d : undefined
}

if (typeof window !== 'undefined') {
  depth = readDepth() ?? 0
  history.replaceState({ ...(history.state ?? {}), [KEY]: depth }, '')
  window.addEventListener('hashchange', () => {
    const known = readDepth()
    if (known !== undefined) depth = known
    else {
      depth += 1
      history.replaceState({ ...(history.state ?? {}), [KEY]: depth }, '')
    }
  })
}

/** Back to where the child came from; Home when this is where Kislap was opened. */
export function goBack(): void {
  if (depth > 0) history.back()
  else location.hash = '#/'
}
