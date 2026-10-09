import { beforeEach, describe, expect, it } from 'vitest'
import { SETTINGS_KEY, loadSettings, saveSettings } from './settings'

const store = new Map<string, string>()
beforeEach(() => {
  store.clear()
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  } as Storage
})

describe('settings', () => {
  it('defaults to sound on and day theme', () => {
    expect(loadSettings()).toEqual({ version: 1, sound: true, theme: 'day' })
  })

  it('round-trips through its own key, not the progress key', () => {
    saveSettings({ version: 1, sound: false, theme: 'gabi' })
    expect(store.has(SETTINGS_KEY)).toBe(true)
    expect(SETTINGS_KEY).not.toBe('kislap.progress.v1')
    expect(loadSettings()).toEqual({ version: 1, sound: false, theme: 'gabi' })
  })

  it('falls back to defaults on bad JSON', () => {
    store.set(SETTINGS_KEY, '{oops')
    expect(loadSettings().sound).toBe(true)
  })

  it('does not throw when the browser refuses to save (full or blocked storage)', () => {
    globalThis.localStorage = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError') } } as unknown as Storage
    expect(() => saveSettings({ version: 1, sound: false, theme: 'day' })).not.toThrow()
  })
})
