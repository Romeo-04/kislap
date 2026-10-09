import { describe, expect, it } from 'vitest'
import { chooseTier, DTYPE, TIERS } from './tier'

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
    expect(DTYPE.large).toBe('q4')
    expect(DTYPE.small).toBe('q8')
    expect(TIERS.large.device).toBe('webgpu')
    expect(TIERS.small.device).toBe('wasm')
  })

  it('keeps both tiers under the download targets (300 MB laptop, 150 MB phone)', () => {
    expect(TIERS.large.approxMB).toBeLessThanOrEqual(300)
    expect(TIERS.small.approxMB).toBeLessThanOrEqual(150)
  })
})
