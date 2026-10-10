// Device settings: sound, music volume and night theme (Claude Design layer 6). Kept apart from progress
// (ADR-0008) so a settings change never risks a child's stars or stickers.
export const SETTINGS_KEY = 'kislap.settings.v1'

export interface Settings {
  version: 1
  sound: boolean
  /** background music volume, 0..1 (0 = off) */
  music: number
  theme: 'day' | 'gabi'
}

export function defaultSettings(): Settings {
  return { version: 1, sound: true, music: 0.4, theme: 'day' }
}

export function loadSettings(): Settings {
  try {
    const raw = globalThis.localStorage?.getItem(SETTINGS_KEY)
    if (!raw) return defaultSettings()
    const parsed = JSON.parse(raw) as Partial<Settings>
    if (parsed.version !== 1) return defaultSettings()
    const s = { ...defaultSettings(), ...parsed }
    // older saves have no music field; a damaged value falls back to the default
    s.music = typeof s.music === 'number' && Number.isFinite(s.music) ? Math.min(1, Math.max(0, s.music)) : defaultSettings().music
    return s
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
