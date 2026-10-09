// Device settings: sound and night theme (Claude Design layer 6). Kept apart from progress
// (ADR-0008) so a settings change never risks a child's stars or stickers.
export const SETTINGS_KEY = 'kislap.settings.v1'

export interface Settings {
  version: 1
  sound: boolean
  theme: 'day' | 'gabi'
}

export function defaultSettings(): Settings {
  return { version: 1, sound: true, theme: 'day' }
}

export function loadSettings(): Settings {
  try {
    const raw = globalThis.localStorage?.getItem(SETTINGS_KEY)
    if (!raw) return defaultSettings()
    const parsed = JSON.parse(raw) as Partial<Settings>
    return parsed.version === 1 ? { ...defaultSettings(), ...parsed } : defaultSettings()
  } catch {
    return defaultSettings()
  }
}

export function saveSettings(s: Settings): void {
  try {
    globalThis.localStorage?.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    // full or blocked storage: the switch still works for this visit
  }
}
