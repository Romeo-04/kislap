import { describe, expect, it } from 'vitest'
import { checkedByDefault, parseName, SETUPS } from './devkit'

describe('parseName', () => {
  it('reads the clip and the reader from a file name', () => {
    expect(parseName('story-1-1__marcus.m4a')).toEqual({ clip: 'story-1-1', reader: 'marcus' })
  })

  it('uses "unknown" when the name has no reader', () => {
    expect(parseName('story-2-3.m4a')).toEqual({ clip: 'story-2-3', reader: 'unknown' })
  })

  it('only drops the last extension', () => {
    expect(parseName('story-3-8__a.b.webm')).toEqual({ clip: 'story-3-8', reader: 'a.b' })
  })
})

describe('checkedByDefault', () => {
  it('leaves local models and known failures unchecked', () => {
    const on = SETUPS.filter(checkedByDefault).map((s) => s.label)
    expect(on).toContain('base q8 (WASM)')
    expect(SETUPS.filter((s) => s.local).every((s) => !on.includes(s.label))).toBe(true)
    expect(SETUPS.filter((s) => s.fails).every((s) => !on.includes(s.label))).toBe(true)
  })

  it('keeps a hosted model first, because the golden page ticks the first setup', () => {
    expect(checkedByDefault(SETUPS[0])).toBe(true)
  })
})