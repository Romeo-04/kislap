import { beforeEach, describe, expect, it } from 'vitest'
import { isUnlocked, lock, makeChallenge, tryUnlock } from './parentGate'

const store = new Map<string, string>()
globalThis.sessionStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage

beforeEach(() => store.clear())

describe('parent gate', () => {
  it('asks a one-digit times two-digit question an adult can do', () => {
    const c = makeChallenge(() => 0.5)
    expect(c.a).toBeGreaterThanOrEqual(6)
    expect(c.a).toBeLessThanOrEqual(9)
    expect(c.b).toBeGreaterThanOrEqual(11)
    expect(c.b).toBeLessThanOrEqual(19)
    expect(c.answer).toBe(c.a * c.b)
  })

  it('is locked until the right answer is given', () => {
    const c = makeChallenge(() => 0)
    expect(isUnlocked()).toBe(false)
    expect(tryUnlock(c, String(c.answer + 1))).toBe(false)
    expect(isUnlocked()).toBe(false)
    expect(tryUnlock(c, ` ${c.answer} `)).toBe(true)
    expect(isUnlocked()).toBe(true)
  })

  it('locks again on request', () => {
    const c = makeChallenge(() => 0)
    tryUnlock(c, String(c.answer))
    lock()
    expect(isUnlocked()).toBe(false)
  })
})
