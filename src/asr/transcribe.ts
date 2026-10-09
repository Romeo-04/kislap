// STUB — real worker client: issue #14 (model engineer). Contract: docs/architecture.md §3.
// Fake mode returns FAKE_HEARD after a short delay so the Reading screen can be built now.
import { pickTier, type TierInfo } from './tier'

export interface TranscribeResult {
  text: string
  ms: number
  words?: { word: string; start: number; end: number }[]
}

export interface LoadProgress {
  loaded: number
  total: number
  file: string
}

let fakeHeard = ''

/** Dev helper: set what the fake model "hears" next. */
export function setFakeHeard(text: string): void {
  fakeHeard = text
}

export async function loadModel(onProgress?: (p: LoadProgress) => void): Promise<TierInfo> {
  onProgress?.({ loaded: 1, total: 1, file: 'fake' })
  return pickTier()
}

export async function transcribe(_audio: Float32Array): Promise<TranscribeResult> {
  await new Promise((r) => setTimeout(r, 600))
  return { text: fakeHeard, ms: 600 }
}

export async function isModelCached(): Promise<boolean> {
  return false
}

export async function warmUp(): Promise<void> {}
