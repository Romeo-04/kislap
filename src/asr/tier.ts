// Model tiers (issue #16). Both tiers run Whisper base:
//   small = WebAssembly, q8 (about 73 MB). THE DEFAULT ON EVERY DEVICE. This is the setup the team
//           tested end to end, offline, on the laptop and the phone. Golden clips: 77%, 3.0 s median
//           on a laptop, 10.5 s on the Realme GT 7T.
//   large = WebGPU, fp16 (about 139 MB). Only with ?tier=large in the URL. It was benchmarked on one
//           reader's golden clips only (79%, 1.0 s median); it has not run through the full reading
//           loop or the offline check on a real GPU. Defaulting to it would also make a laptop that
//           already cached q8 download 139 MB again and lose Offline ready. See GPU_BY_DEFAULT.
// q4 on WebGPU was dropped: 72% accuracy, worse than q8, with garbled text in the first benchmark.
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
/**
 * Off until the GPU tier passes the full reading loop and the offline check on the demo laptop.
 * While it is off, no device picks the GPU tier by itself: only ?tier=large does.
 */
export const GPU_BY_DEFAULT = false

/**
 * The order of the rules, kept pure so it can be tested: ?tier= override, then the saved tier, then
 * the probe (only when gpuByDefault is on), else the WebAssembly tier.
 */
export function chooseTier(input: {
  forced?: string | null
  saved?: ModelTier
  gpu: boolean
  mobile: boolean
  gpuByDefault?: boolean
}): TierInfo {
  if (input.forced === 'large' || input.forced === 'small') return TIERS[input.forced]
  if (input.saved) return TIERS[input.saved]
  const gpuByDefault = input.gpuByDefault ?? GPU_BY_DEFAULT
  return gpuByDefault && input.gpu && !input.mobile ? TIERS.large : TIERS.small
}

/** `saved` is the tier remembered in on-device progress (it is set when the GPU tier failed). */
export async function pickTier(saved?: ModelTier): Promise<TierInfo> {
  const forced = new URLSearchParams(location.search).get('tier')
  // Skip the probe when a rule already decided, or when its answer would not be used.
  const gpu = forced || saved || !GPU_BY_DEFAULT ? false : await hasWebGPU()
  return chooseTier({ forced, saved, gpu, mobile: isMobile() })
}
