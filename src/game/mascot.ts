// Ningning's moods (docs/uml/state.md §2). Art and animation: issue #9 (designer).

export type MascotMood = 'idle' | 'listening' | 'thinking' | 'cheering' | 'encouraging' | 'celebrating'
export type MascotEvent = 'mic-on' | 'mic-off' | 'scored' | 'silence' | 'story-done'

export function moodFor(event: MascotEvent, accuracy = 0): MascotMood {
  switch (event) {
    case 'mic-on': return 'listening'
    case 'mic-off': return 'thinking'
    case 'silence': return 'encouraging'
    case 'story-done': return 'celebrating'
    case 'scored': return accuracy >= 0.7 ? 'cheering' : 'encouraging'
  }
}

export const MOOD_HOLD_MS = 2000

const DEFAULT_GLOW: Record<MascotMood, number> = {
  idle: 0.6, listening: 0.75, thinking: 0.5, cheering: 0.95, encouraging: 0.55, celebrating: 1,
}

/** Ningning's brightness when the screen does not drive it (Claude Design Ningning table). */
export function defaultGlow(mood: MascotMood): number {
  return DEFAULT_GLOW[mood]
}

/** Short reactions fall back to idle; every other mood waits for the next event. */
export function settleMood(mood: MascotMood): { next: MascotMood; afterMs: number } | null {
  return mood === 'cheering' || mood === 'encouraging' ? { next: 'idle', afterMs: MOOD_HOLD_MS } : null
}

/** 0..1 brightness of Ningning's light. Never fully dark. */
export function glowFor(accuracy: number): number {
  return 0.3 + 0.7 * Math.min(1, Math.max(0, accuracy))
}
