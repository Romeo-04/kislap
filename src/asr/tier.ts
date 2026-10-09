// Model tiers (issue #16). Both tiers run Whisper base:
//   large = WebGPU, fp16 (about 139 MB). Laptops with a GPU that supports half precision.
//           Golden clips: 79% mean accuracy, 1.0 s median per sentence.
//   small = WebAssembly, q8 (about 73 MB). Phones and anything without WebGPU or shader-f16.
//           Golden clips: 77%, 3.0 s median. 10.5 s on the Realme GT 7T.
// q4 on WebGPU was dropped: 72% accuracy, worse than q8. fp16 beat q8 and q4 on both accuracy and speed.
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
  large: { tier: 'large', modelId: 'onnx-community/whisper-base', device: 'webgpu', approxMB: 139 },
  small: { tier: 'small', modelId: 'onnx-community/whisper-base', device: 'wasm', approxMB: 73 },
}

// Precision per tier. Shared by the worker (what it loads) and the cache check (what it looks for).
export const DTYPE: Record<ModelTier, DataType | Record<string, DataType>> = {
  small: 'q8',
  large: 'fp16',
}

/**
 * True when this device can run the GPU tier: WebGPU with the shader-f16 feature, because the tier is fp16.
 * requestAdapter can hang on a broken driver, so it gets a few seconds and then the answer is no.
 */
export async function hasWebGPU(timeoutMs = 3000): Promise<boolean> {
  type Adapter = { features?: { has(name: string): boolean } }
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<Adapter | null> } }).gpu
  if (!gpu) return false
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const adapter = await Promise.race([
      gpu.requestAdapter(),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), timeoutMs)
      }),
    ])
    return adapter?.features?.has('shader-f16') === true
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
