// Model tiers (issue #16). Both tiers run Whisper base, so the child-facing quality is the same:
//   large = WebGPU, q4 (about 136 MB). Laptops with a GPU. 1.3 s per sentence in our tests.
//   small = WebAssembly, q8 (about 73 MB). Phones and anything without WebGPU.
// The names stay 'large' and 'small' because on-device progress already stores them (ADR-0008).
// Why not the Filipino small models: too slow (6 to 26 s on a laptop) and too large. See PROGRESS.md.

import type { DataType } from '@huggingface/transformers'

export type ModelTier = 'large' | 'small'

export interface TierInfo {
  tier: ModelTier
  modelId: string
  device: 'webgpu' | 'wasm'
  approxMB: number
}

export const TIERS: Record<ModelTier, TierInfo> = {
  large: { tier: 'large', modelId: 'onnx-community/whisper-base', device: 'webgpu', approxMB: 136 },
  small: { tier: 'small', modelId: 'onnx-community/whisper-base', device: 'wasm', approxMB: 73 },
}

// Precision per tier. Shared by the worker (what it loads) and the cache check (what it looks for).
export const DTYPE: Record<ModelTier, DataType | Record<string, DataType>> = {
  small: 'q8',
  large: 'q4',
}

export async function hasWebGPU(): Promise<boolean> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu
  if (!gpu) return false
  try {
    return (await gpu.requestAdapter()) != null
  } catch {
    return false
  }
}

/** Phones have WebGPU but it was unusable on one we tested (97 s per sentence), so they use WASM. */
export function isMobile(): boolean {
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } }
  return nav.userAgentData?.mobile ?? /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

/** The order of the rules, kept pure so it can be tested: ?tier= override, then the saved tier, then the probe. */
export function chooseTier(input: { forced?: string | null; saved?: ModelTier; gpu: boolean; mobile: boolean }): TierInfo {
  if (input.forced === 'large' || input.forced === 'small') return TIERS[input.forced]
  if (input.saved) return TIERS[input.saved]
  return input.gpu && !input.mobile ? TIERS.large : TIERS.small
}

/** `saved` is the tier remembered in on-device progress (it is set when the GPU tier failed). */
export async function pickTier(saved?: ModelTier): Promise<TierInfo> {
  const forced = new URLSearchParams(location.search).get('tier')
  const gpu = forced || saved ? false : await hasWebGPU() // skip the probe when a rule already decided
  return chooseTier({ forced, saved, gpu, mobile: isMobile() })
}
