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

/** 0..1 brightness of Ningning's light. Never fully dark. */
export function glowFor(accuracy: number): number {
  return 0.3 + 0.7 * Math.min(1, Math.max(0, accuracy))
}
