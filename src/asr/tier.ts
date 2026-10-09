// STUB — real tier choice: issue #16 (model engineer). Decided models: docs/validation.md (Q1).

export type ModelTier = 'large' | 'small'

export interface TierInfo {
  tier: ModelTier
  modelId: string
  device: 'webgpu' | 'wasm'
  approxMB: number
}

export const TIERS: Record<ModelTier, TierInfo> = {
  large: { tier: 'large', modelId: 'internetoftim/whisper-small-pld-fil-ONNX', device: 'webgpu', approxMB: 586 },
  small: { tier: 'small', modelId: 'onnx-community/whisper-base', device: 'wasm', approxMB: 77 },
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

export async function pickTier(): Promise<TierInfo> {
  const forced = new URLSearchParams(location.search).get('tier')
  if (forced === 'large' || forced === 'small') return TIERS[forced]
  return TIERS.small
}
