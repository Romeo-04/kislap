// English is the default UI language; tests that check the Filipino copy say so by saving it first.
import { afterEach, beforeEach, vi } from 'vitest'
import { PROGRESS_KEY, defaultProgress } from '../game/progress'

/** Call at the top of a test file: every test starts with Filipino saved as the chosen language. */
export function savedFilipino(): void {
  beforeEach(() => {
    const m = new Map([[PROGRESS_KEY, JSON.stringify({ ...defaultProgress(), lang: 'fil' })]])
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => m.get(k) ?? null,
      setItem: (k: string, v: string) => void m.set(k, v),
      removeItem: (k: string) => void m.delete(k),
    })
  })
  afterEach(() => vi.unstubAllGlobals())
}
