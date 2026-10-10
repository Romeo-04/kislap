import { beforeEach, describe, expect, it } from 'vitest'
import { isFirstVisit, markVisited, resetVisits } from './entrance'

describe('first visit per app open', () => {
  beforeEach(resetVisits)

  it('is a first visit until the screen is marked, then not for the rest of the app open', () => {
    expect(isFirstVisit('home')).toBe(true)
    expect(isFirstVisit('home')).toBe(true) // asking twice (StrictMode) does not use it up
    markVisited('home')
    expect(isFirstVisit('home')).toBe(false)
  })

  it('counts each screen on its own', () => {
    markVisited('home')
    expect(isFirstVisit('map')).toBe(true)
  })
})
