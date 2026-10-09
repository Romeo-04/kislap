import type { Settings } from '../game/settings'

/** Night mode is a data attribute on <html>; tokens.css swaps the colours. */
export function applyTheme(theme: Settings['theme']): void {
  if (theme === 'gabi') document.documentElement.dataset.theme = 'gabi'
  else delete document.documentElement.dataset.theme
  // the phone's status bar follows the sky, day and night
  const sky = getComputedStyle(document.documentElement).getPropertyValue('--sky').trim()
  if (sky) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', sky)
}
