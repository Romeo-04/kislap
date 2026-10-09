import { describe, expect, it } from 'vitest'
import { initialReadiness, readinessReducer as next, type Readiness } from './readiness'

const checked = (modelCached: boolean, online: boolean): Readiness =>
  next(initialReadiness, { type: 'checked', modelCached, online })

describe('readiness (docs/uml/state.md §3)', () => {
  it('starts in checking', () => {
    expect(initialReadiness.status).toBe('checking')
  })

  it('is offline-ready when the model is already cached, online or not', () => {
    expect(checked(true, true).status).toBe('ready')
    expect(checked(true, false).status).toBe('ready')
  })

  it('needs a download when the model is missing and we are online', () => {
    expect(checked(false, true).status).toBe('needs-download')
  })

  it('is blocked when the model is missing and we are offline', () => {
    expect(checked(false, false).status).toBe('blocked')
  })

  it('goes blocked → needs-download when the connection comes back', () => {
    expect(next(checked(false, false), { type: 'online' }).status).toBe('needs-download')
  })

  it('tracks download progress as a 0..1 fraction', () => {
    let s = next(checked(false, true), { type: 'download-start' })
    expect(s).toEqual({ status: 'downloading', progress: 0 })
    s = next(s, { type: 'progress', loaded: 50, total: 200 })
    expect(s).toEqual({ status: 'downloading', progress: 0.25 })
  })

  it('ignores progress events when not downloading', () => {
    const s = checked(true, true)
    expect(next(s, { type: 'progress', loaded: 1, total: 2 })).toBe(s)
  })

  it('is ready after the download finishes', () => {
    const s = next(next(checked(false, true), { type: 'download-start' }), { type: 'download-done' })
    expect(s.status).toBe('ready')
  })

  it('returns to needs-download with an error message when the download fails', () => {
    const s = next(next(checked(false, true), { type: 'download-start' }), { type: 'download-failed', message: 'network' })
    expect(s).toEqual({ status: 'needs-download', error: 'network' })
  })

  it('goes ready → needs-download when the browser evicted the model', () => {
    expect(next(checked(true, true), { type: 'evicted' }).status).toBe('needs-download')
  })
})
