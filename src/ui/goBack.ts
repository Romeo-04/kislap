// back only within Kislap: a shared link opened in a tab with other history must not leave the app
let movedInApp = false
if (typeof window !== 'undefined') window.addEventListener('hashchange', () => (movedInApp = true))

/** Back to where the child came from; Home when Kislap was opened on this screen. */
export function goBack(): void {
  if (movedInApp) history.back()
  else location.hash = '#/'
}
