// Model tiers (issue #16). Both tiers run Whisper base, but q4 reads a little worse than q8 (72% against 77%
// mean accuracy on 24 clean golden clips), so the GPU tier trades some accuracy for speed. See PROGRESS.md:
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

/** requestAdapter can hang on a broken driver, so give it a few seconds and then say no. */
export async function hasWebGPU(timeoutMs = 3000): Promise<boolean> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu
  if (!gpu) return false
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const adapter = await Promise.race([
      gpu.requestAdapter(),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), timeoutMs)
      }),
    ])
    return adapter != null
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}
/**
 * Phones have WebGPU but it was unusable on one we tested (97 s per sentence), so they use WASM.
 * iPadOS Safari and Chrome's "desktop site" mode hide the phone from the user agent, so a touch Mac
 * or a coarse primary pointer counts too.
 */
export function isMobile(): boolean {
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } }
  const byAgent = nav.userAgentData?.mobile ?? /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent)
  const touchMac = /Macintosh/i.test(nav.userAgent) && (nav.maxTouchPoints ?? 0) > 1
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  return byAgent || touchMac || coarse
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
