import { beforeEach, describe, expect, it, vi } from 'vitest'

// a tiny browser: hash links push entries with no state, back restores an entry's state
function fakeBrowser(startHash: string, otherSites = 3) {
  const entries: { hash: string; state: unknown }[] = [{ hash: startHash, state: null }]
  let i = 0
  let onHash: () => void = () => {}
  const history = {
    get length() { return otherSites + entries.length },
    get state() { return entries[i].state },
    replaceState: (s: unknown) => void (entries[i].state = s),
    back: vi.fn(() => {
      if (i === 0) { left = true; return }
      i -= 1; location.hash = entries[i].hash; onHash()
    }),
  }
  let left = false
  const location = {
    _hash: startHash,
    get hash() { return this._hash },
    set hash(h: string) { this._hash = h },
  }
  const go = (h: string) => {
    entries.splice(i + 1); entries.push({ hash: h, state: null }); i += 1; location.hash = h; onHash()
  }
  globalThis.window = { addEventListener: (_: string, f: () => void) => void (onHash = f) } as unknown as Window & typeof globalThis
  globalThis.history = history as unknown as History
  globalThis.location = location as unknown as Location
  return { go, left: () => left, hash: () => location.hash }
}

describe('goBack', () => {
  beforeEach(() => vi.resetModules())

  it('goes Home from a shared link, even when the tab has other history', async () => {
    const b = fakeBrowser('#/miccheck')
    const { goBack } = await import('./goBack')
    goBack()
    expect(b.left()).toBe(false)
    expect(b.hash()).toBe('#/')
  })

  it('steps back after moving inside Kislap', async () => {
    const b = fakeBrowser('#/settings')
    const { goBack } = await import('./goBack')
    b.go('#/miccheck')
    goBack()
    expect(b.hash()).toBe('#/settings')
  })

  it('does not leave Kislap after stepping back to where it was opened', async () => {
    const b = fakeBrowser('#/settings')
    const { goBack } = await import('./goBack')
    b.go('#/miccheck')
    goBack()
    goBack()
    expect(b.left()).toBe(false)
    expect(b.hash()).toBe('#/')
  })
})
