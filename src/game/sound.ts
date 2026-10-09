// Soft sounds made on the device with Web Audio (issue #11): no audio files, nothing to download.
export interface Note {
  freq: number
  at: number // seconds from start
  dur: number
  gain: number
}

export type SoundName = 'reveal' | 'star' | 'sticker' | 'pop'

// gentle sine notes in C major; quiet on purpose, a child may play with headphones
export const SOUNDS: Record<SoundName, Note[]> = {
  reveal: [{ freq: 784, at: 0, dur: 0.09, gain: 0.05 }],
  star: [
    { freq: 659, at: 0, dur: 0.14, gain: 0.08 },
    { freq: 988, at: 0.1, dur: 0.22, gain: 0.08 },
  ],
  sticker: [
    { freq: 523, at: 0, dur: 0.16, gain: 0.08 },
    { freq: 659, at: 0.12, dur: 0.16, gain: 0.08 },
    { freq: 784, at: 0.24, dur: 0.16, gain: 0.08 },
    { freq: 1047, at: 0.36, dur: 0.34, gain: 0.07 },
  ],
  pop: [{ freq: 440, at: 0, dur: 0.07, gain: 0.1 }],
}

let ctx: AudioContext | undefined

/** Plays a sound unless it is off or the browser has no Web Audio. Returns whether it played. */
export function playSound(name: SoundName, settings: { sound: boolean }): boolean {
  if (!settings.sound) return false
  const AC = globalThis.AudioContext
  if (!AC) return false
  try {
    ctx ??= new AC()
    // phones start or park the context suspended (no tap yet, tab in background, a call)
    if (ctx.state !== 'running') void ctx.resume().catch(() => {})
    const now = ctx.currentTime
    for (const n of SOUNDS[name]) {
      const osc = ctx.createOscillator()
      const amp = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = n.freq
      // short attack and an exponential tail, so nothing clicks
      amp.gain.setValueAtTime(0.0001, now + n.at)
      amp.gain.exponentialRampToValueAtTime(n.gain, now + n.at + 0.015)
      amp.gain.exponentialRampToValueAtTime(0.0001, now + n.at + n.dur)
      osc.connect(amp).connect(ctx.destination)
      osc.start(now + n.at)
      osc.stop(now + n.at + n.dur + 0.02)
    }
    return true
  } catch {
    return false // a sound must never break reading
  }
}
