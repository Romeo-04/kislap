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
    go: vi.fn((n: number) => {
      i = Math.max(0, Math.min(entries.length - 1, i + n)); location.hash = entries[i].hash; onHash()
    }),
  }
  let left = false
  const location = {
    _hash: startHash,
    get hash() { return this._hash },
    set hash(h: string) { this._hash = h },
    // a hash-only replace: same entry, new hash, its state dropped (as browsers do)
    replace(url: string) { entries[i] = { hash: url, state: null }; this._hash = url; onHash() },
  }
  const go = (h: string) => {
    entries.splice(i + 1); entries.push({ hash: h, state: null }); i += 1; location.hash = h; onHash()
  }
  globalThis.window = { addEventListener: (_: string, f: () => void) => void (onHash = f) } as unknown as Window & typeof globalThis
  globalThis.history = history as unknown as History
  globalThis.location = location as unknown as Location
  return { go, left: () => left, hash: () => location.hash, entries: () => entries.length, at: () => i }
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

describe('goUp', () => {
  beforeEach(() => vi.resetModules())

  it('Home, map, story, up, up: lands on Home, not back on the story', async () => {
    const b = fakeBrowser('#/')
    const { goUp } = await import('./goBack')
    b.go('#/map')
    b.go('#/reading/story-1')
    goUp('#/map')
    expect(b.hash()).toBe('#/map')
    expect(b.at()).toBe(1) // went back to the map's own entry, nothing replaced
    goUp('#/')
    expect(b.hash()).toBe('#/')
    expect(b.at()).toBe(0)
    expect(b.entries()).toBe(3) // the story stays as forward history
  })

  it('jumps back past screens in between to the parent it came through', async () => {
    const b = fakeBrowser('#/')
    const { goUp } = await import('./goBack')
    b.go('#/map')
    b.go('#/reading/story-1')
    b.go('#/result/story-1')
    b.go('#/map') // "more stories"
    goUp('#/')
    expect(b.hash()).toBe('#/')
    expect(history.go).toHaveBeenCalledWith(-4)
    expect(b.at()).toBe(0)
  })

  it('does nothing when already on the parent', async () => {
    const b = fakeBrowser('#/')
    const { goUp } = await import('./goBack')
    goUp('#/')
    expect(b.hash()).toBe('#/')
    expect(b.entries()).toBe(1)
    b.go('#/map')
    expect(b.at()).toBe(1) // the next link still adds an entry
  })

  it('remembers the way back after a reload (an app update reloads open pages)', async () => {
    const b = fakeBrowser('#/')
    await import('./goBack')
    b.go('#/map')
    b.go('#/reading/story-1')
    vi.resetModules() // the page reloads: the module starts over, history and its states stay
    const { goUp } = await import('./goBack')
    goUp('#/map')
    expect(b.at()).toBe(1)
    goUp('#/')
    expect(b.at()).toBe(0)
    expect(b.entries()).toBe(3)
  })

  it('replaces when the trail was lost, e.g. after a reload deep inside', async () => {
    const b = fakeBrowser('#/reading/story-1')
    history.replaceState({ kislapDepth: 2 }, '') // a reload two steps in: the depth survives, the trail does not
    const { goUp } = await import('./goBack')
    goUp('#/map')
    expect(b.hash()).toBe('#/map')
    expect(b.entries()).toBe(1)
  })

  it('replaces the entry when the parent is not behind it (a shared link)', async () => {
    const b = fakeBrowser('#/map')
    const { goUp, goBack } = await import('./goBack')
    goUp('#/')
    expect(b.hash()).toBe('#/')
    expect(b.entries()).toBe(1)
    goBack() // still never leaves Kislap
    expect(b.left()).toBe(false)
  })
})
