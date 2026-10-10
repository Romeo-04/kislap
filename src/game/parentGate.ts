// Parent/teacher mode: a grown-up question (a one-digit times two-digit multiplication) guards
// adult screens such as adding a story. Easy for an adult, hard for a Grade 1-3 child. The unlock
// lasts until the app is closed (sessionStorage) and stays on the device.

export interface Challenge {
  a: number
  b: number
  answer: number
}

const KEY = 'kislap.parentMode'

export function makeChallenge(random: () => number = Math.random): Challenge {
  const a = 6 + Math.floor(random() * 4) // 6..9
  const b = 11 + Math.floor(random() * 9) // 11..19
  return { a, b, answer: a * b }
}

export function isUnlocked(): boolean {
  try {
    return globalThis.sessionStorage?.getItem(KEY) === '1'
  } catch {
    return false
  }
}

/** Unlocks parent/teacher mode when the answer is right. */
export function tryUnlock(c: Challenge, input: string): boolean {
  if (Number(input.trim()) !== c.answer) return false
  try {
    globalThis.sessionStorage?.setItem(KEY, '1')
  } catch {
    // storage blocked: still let the adult in for this screen
  }
  return true
}

export function lock(): void {
  try {
    globalThis.sessionStorage?.removeItem(KEY)
  } catch {
    // nothing to clear
  }
}
