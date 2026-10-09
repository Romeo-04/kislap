// Light vibration on supported phones (Android Chrome). Follows the Sound setting, so one switch
// turns all feedback off. Silent everywhere vibration is unsupported (iOS, desktop).
import { loadSettings } from '../game/settings'

export function haptic(pattern: number | number[] = 12): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  if (!loadSettings().sound) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // Some browsers throw before the first user gesture; vibration is optional.
  }
}
