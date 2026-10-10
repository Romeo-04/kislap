// Background music made on the device with Web Audio: a slow, quiet loop in C major. No audio files,
// nothing to download. It never plays on a screen that listens to the mic, so the speech model only
// ever hears the child.
import type { Note } from './sound'

/** Screens that use the microphone: music is always off there. */
export const QUIET_ROUTES = new Set(['reading', 'wordpop', 'miccheck', 'mictest', 'asrtest', 'bench', 'golden'])

export function musicAllowed(route: string, volume: number): boolean {
  return volume > 0 && !QUIET_ROUTES.has(route)
}

const BPM = 80
const BEAT = 60 / BPM
/** One loop: four bars of four beats. */
export const LOOP_SECONDS = 16 * BEAT

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

// C, Am, F, G: a soft bass note per bar and a pentatonic tune on top
const BASS = [48, 45, 41, 43]
const TUNE: [beat: number, midi: number, beats: number][] = [
  [0, 72, 1], [1, 76, 1], [2, 79, 2],
  [4, 76, 1], [5, 72, 1], [6, 74, 2],
  [8, 72, 1], [9, 69, 1], [10, 72, 1], [11, 74, 1],
  [12, 76, 1.5], [13.5, 74, 0.5], [14, 72, 2],
]

/** The notes of one loop, in seconds from the loop start. */
export function loopNotes(): (Note & { wave: OscillatorType })[] {
  const bass = BASS.map((m, bar) => ({ freq: hz(m), at: bar * 4 * BEAT, dur: 4 * BEAT * 0.95, gain: 0.05, wave: 'sine' as const }))
  const tune = TUNE.map(([b, m, len]) => ({ freq: hz(m), at: b * BEAT, dur: len * BEAT * 0.9, gain: 0.035, wave: 'triangle' as const }))
  return [...bass, ...tune]
}

let ctx: AudioContext | undefined
let master: GainNode | undefined
let timer: ReturnType<typeof setTimeout> | undefined
let nextLoopAt = 0
let wanted = 0 // the volume asked for; 0 = stopped

function schedule() {
  if (!ctx || !master) return
  const start = Math.max(nextLoopAt, ctx.currentTime + 0.05)
  for (const n of loopNotes()) {
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = n.wave
    osc.frequency.value = n.freq
    // slow attack and release: a pad, never a click
    amp.gain.setValueAtTime(0.0001, start + n.at)
    amp.gain.exponentialRampToValueAtTime(n.gain, start + n.at + 0.08)
    amp.gain.exponentialRampToValueAtTime(0.0001, start + n.at + n.dur)
    osc.connect(amp).connect(master)
    osc.start(start + n.at)
    osc.stop(start + n.at + n.dur + 0.05)
  }
  nextLoopAt = start + LOOP_SECONDS
  // queue the next loop shortly before this one ends
  timer = setTimeout(schedule, Math.max(0, (nextLoopAt - ctx.currentTime - 1) * 1000))
}

// Browsers start audio only after a tap: resume on the first one.
function resumeOnTap() {
  const go = () => {
    if (wanted > 0) void ctx?.resume().catch(() => {})
  }
  window.addEventListener('pointerdown', go, { once: true })
  window.addEventListener('keydown', go, { once: true })
}

/** Starts, re-levels or stops the music for this screen and volume (0..1). Safe to call often. */
export function syncMusic(route: string, volume: number): void {
  const v = musicAllowed(route, volume) ? volume : 0
  wanted = v
  const AC = globalThis.AudioContext
  if (!AC) return
  try {
    if (v === 0) {
      if (!ctx || !master) return
      // fade out, then drop this session's notes so a restart never overlaps them
      const old = master
      old.gain.setTargetAtTime(0, ctx.currentTime, 0.15)
      setTimeout(() => old.disconnect(), 1000)
      master = undefined
      clearTimeout(timer)
      timer = undefined
      nextLoopAt = 0
      return
    }
    if (!ctx) {
      ctx = new AC()
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) void ctx?.suspend().catch(() => {})
        else if (wanted > 0) void ctx?.resume().catch(() => {})
      })
    }
    if (ctx.state !== 'running') {
      void ctx.resume().catch(() => {})
      resumeOnTap()
    }
    if (!master) {
      master = ctx.createGain()
      master.gain.value = 0
      master.connect(ctx.destination)
    }
    // 0.5 at full volume keeps it well under the sound effects
    master.gain.setTargetAtTime(v * 0.5, ctx.currentTime, 0.2)
    if (!timer) schedule()
  } catch {
    // music must never break the game
  }
}
