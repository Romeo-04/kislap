import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('goBack', () => {
  beforeEach(() => {
    vi.resetModules()
    const listeners: Record<string, () => void> = {}
    globalThis.window = { addEventListener: (k: string, f: () => void) => void (listeners[k] = f) } as unknown as Window & typeof globalThis
    globalThis.history = { length: 5, back: vi.fn() } as unknown as History
    globalThis.location = { hash: '#/miccheck' } as Location
    ;(globalThis as { fire?: (k: string) => void }).fire = (k) => listeners[k]?.()
  })

  it('goes Home from a shared link, even when the tab has other history', async () => {
    const { goBack } = await import('./goBack')
    goBack()
    expect(history.back).not.toHaveBeenCalled()
    expect(location.hash).toBe('#/')
  })

  it('steps back after moving inside Kislap', async () => {
    const { goBack } = await import('./goBack')
    ;(globalThis as unknown as { fire: (k: string) => void }).fire('hashchange')
    goBack()
    expect(history.back).toHaveBeenCalled()
  })
})
