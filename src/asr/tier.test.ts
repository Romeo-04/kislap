import { afterEach, describe, expect, it, vi } from 'vitest'
import { chooseTier, DTYPE, hasWebGPU, isMobile, TIERS } from './tier'

const desktopGpu = { gpu: true, mobile: false }

describe('chooseTier', () => {
  it('uses the GPU tier on a desktop with WebGPU', () => {
    expect(chooseTier(desktopGpu)).toBe(TIERS.large)
  })

  it('uses the WASM tier without WebGPU', () => {
    expect(chooseTier({ gpu: false, mobile: false })).toBe(TIERS.small)
  })

  it('uses the WASM tier on a phone even when WebGPU exists', () => {
    expect(chooseTier({ gpu: true, mobile: true })).toBe(TIERS.small)
  })

  it('lets ?tier= override everything', () => {
    expect(chooseTier({ ...desktopGpu, forced: 'small', saved: 'large' })).toBe(TIERS.small)
    expect(chooseTier({ gpu: false, mobile: true, forced: 'large' })).toBe(TIERS.large)
  })

  it('ignores a ?tier= value that is not a tier', () => {
    expect(chooseTier({ ...desktopGpu, forced: 'huge' })).toBe(TIERS.large)
    expect(chooseTier({ ...desktopGpu, forced: null })).toBe(TIERS.large)
  })

  it('prefers the saved tier over the probe', () => {
    expect(chooseTier({ ...desktopGpu, saved: 'small' })).toBe(TIERS.small)
  })
})

describe('tier definitions', () => {
  it('has one dtype per tier, matching the device', () => {
    expect(DTYPE.large).toBe('fp16')
    expect(DTYPE.small).toBe('q8')
    expect(TIERS.large.device).toBe('webgpu')
    expect(TIERS.small.device).toBe('wasm')
  })

  it('keeps both tiers under the download targets (300 MB laptop, 150 MB phone)', () => {
    expect(TIERS.large.approxMB).toBeLessThanOrEqual(300)
    expect(TIERS.small.approxMB).toBeLessThanOrEqual(150)
  })
})

describe('hasWebGPU', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('says no when requestAdapter never answers', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('navigator', { gpu: { requestAdapter: () => new Promise(() => {}) } })
    const answer = hasWebGPU(3000)
    await vi.advanceTimersByTimeAsync(3000)
    await expect(answer).resolves.toBe(false)
  })

  it('says no when the adapter lacks half precision, because the GPU tier is fp16', async () => {
    vi.stubGlobal('navigator', { gpu: { requestAdapter: async () => ({ features: new Set<string>() }) } })
    await expect(hasWebGPU()).resolves.toBe(false)
  })

  it('says yes when an adapter comes back', async () => {
    vi.stubGlobal('navigator', { gpu: { requestAdapter: async () => ({ features: new Set(['shader-f16']) }) } })
    await expect(hasWebGPU()).resolves.toBe(true)
  })

  it('says no when requestAdapter throws or returns nothing', async () => {
    vi.stubGlobal('navigator', { gpu: { requestAdapter: async () => { throw new Error('no driver') } } })
    await expect(hasWebGPU()).resolves.toBe(false)
    vi.stubGlobal('navigator', { gpu: { requestAdapter: async () => null } })
    await expect(hasWebGPU()).resolves.toBe(false)
  })
})

describe('isMobile', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('is false on a plain desktop', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', maxTouchPoints: 0 })
    expect(isMobile()).toBe(false)
  })

  it('is true for an Android phone', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Linux; Android 15) Mobile Safari/537.36', maxTouchPoints: 5 })
    expect(isMobile()).toBe(true)
  })

  it('is true for iPadOS Safari, which says it is a Mac', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 5 })
    expect(isMobile()).toBe(true)
  })

  it('is false for a real Mac without touch', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 0 })
    expect(isMobile()).toBe(false)
  })

  it('is true when the primary pointer is coarse, as in Chrome\'s desktop-site mode on a phone', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', maxTouchPoints: 5 })
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    expect(isMobile()).toBe(true)
  })

  it('trusts userAgentData.mobile when the browser gives it', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', maxTouchPoints: 0, userAgentData: { mobile: true } })
    expect(isMobile()).toBe(true)
  })
})