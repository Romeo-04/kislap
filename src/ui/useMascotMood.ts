import { useCallback, useEffect, useState } from 'react'
import { settleMood, type MascotMood } from '../game/mascot'

/**
 * Holds a mood, and lets cheering / encouraging fall back to idle on their own.
 * `beat` changes on every set, even to the same mood, so a second cheer restarts the hold;
 * pass it as the Ningning `key` to replay the one-shot hop.
 */
export function useMascotMood(initial: MascotMood = 'idle') {
  const [state, setState] = useState({ mood: initial, beat: 0 })
  const setMood = useCallback((mood: MascotMood) => setState((s) => ({ mood, beat: s.beat + 1 })), [])
  useEffect(() => {
    const settle = settleMood(state.mood)
    if (!settle) return
    const timer = setTimeout(() => setState((s) => ({ mood: settle.next, beat: s.beat + 1 })), settle.afterMs)
    return () => clearTimeout(timer)
  }, [state])
  return [state.mood, setMood, state.beat] as const
}
