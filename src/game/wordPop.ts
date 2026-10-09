// Word Pop rules (issue #13, spec §9). Pure.
import { similarity } from '../scoring/align'
import { canonical, normalize } from '../scoring/normalize'
import { SCORING } from '../scoring/config'
import type { ReadingNotice } from './readingMachine'

/** The child said the word: one heard token, or the whole clip joined, is close enough. */
export function matchesWord(target: string, heard: string): boolean {
  const want = normalize(target).map(canonical).join('')
  const tokens = normalize(heard).map(canonical)
  if (!want || tokens.length === 0) return false
  return [...tokens, tokens.join('')].some((t) => similarity(want, t) >= SCORING.wordPop)
}

/** After this many misses the bubble pops anyway: Word Pop never blocks the child. */
export const MAX_TRIES = 2

export type WordPopPhase = 'ready' | 'listening' | 'thinking'
/** After this many model failures in a row, Skip appears: a model that keeps failing never strands the child. */
export const MAX_FAILS = 2

/** said: the child said it. helped: it popped after MAX_TRIES misses, or by Skip. */
export type PopKind = 'said' | 'helped'

/** Same kind notices as the Reading screen, so the two never drift apart. */
export type WordPopNotice = ReadingNotice

export interface Bubble {
  word: string
  tries: number
  popped?: PopKind
}

export interface WordPopState {
  bubbles: Bubble[]
  /** The bubble the mic is for. */
  current: number
  phase: WordPopPhase
  /** How the last try or Skip ended, for Ningning's line. Cleared whenever a notice is set. */
  last?: PopKind | 'missed'
  /** Skip pops the current bubble: the model or the mic cannot run, or the model failed MAX_FAILS times. */
  canSkip?: boolean
  /** No cached model: the screen must not record or call the model, which would download it. */
  noModel?: boolean
  /** Model failures in a row. */
  fails?: number
  notice?: WordPopNotice
}

export type WordPopEvent =
  | { type: 'pick'; index: number }
  | { type: 'mic-started' }
  | { type: 'stopped' }
  | { type: 'heard'; text: string }
  | { type: 'silence' }
  | { type: 'failed' }
  | { type: 'mic-failed'; denied: boolean }
  | { type: 'model-unavailable' }
  | { type: 'skip' }

export function initialWordPop(words: string[]): WordPopState {
  // a damaged save can repeat a word; the word is the bubble's identity
  return { bubbles: [...new Set(words)].map((word) => ({ word, tries: 0 })), current: 0, phase: 'ready' }
}

/** A tap on the current bubble opens or closes its syllables; a tap on another moves to it, open, when ready. */
export function tapBubble(s: WordPopState, open: number | undefined, index: number): { open?: number; pick?: number } {
  if (index === s.current) return { open: open === index ? undefined : index }
  if (s.phase !== 'ready' || !s.bubbles[index] || s.bubbles[index].popped) return { open }
  return { open: index, pick: index }
}

export function isDone(s: WordPopState): boolean {
  return s.bubbles.length > 0 && s.bubbles.every((b) => b.popped)
}

// silence, a blank or failed transcription, a mic error and a missing model never count as a try
function kindRetry(s: WordPopState, notice: WordPopNotice): WordPopState {
  return { ...s, phase: 'ready', last: undefined, notice }
}

function failed(s: WordPopState): WordPopState {
  const fails = (s.fails ?? 0) + 1
  return { ...kindRetry(s, 'reading.modelRetry'), fails, canSkip: s.canSkip || fails >= MAX_FAILS }
}

// mark the current bubble popped and move on to the next one still floating
function pop(s: WordPopState, kind: PopKind, tries: number): WordPopState {
  const bubbles = s.bubbles.map((b, i) => (i === s.current ? { ...b, tries, popped: kind } : b))
  return { ...s, bubbles, phase: 'ready', current: nextOpen(bubbles, s.current), last: kind, notice: undefined, fails: 0 }
}

// the next bubble still floating after `from`, wrapping around; `from` itself if none is left
function nextOpen(bubbles: Bubble[], from: number): number {
  for (let step = 1; step <= bubbles.length; step++) {
    const i = (from + step) % bubbles.length
    if (!bubbles[i].popped) return i
  }
  return from
}

export function wordPopReducer(s: WordPopState, e: WordPopEvent): WordPopState {
  switch (e.type) {
    case 'pick':
      return s.phase === 'ready' && s.bubbles[e.index] && !s.bubbles[e.index].popped && e.index !== s.current
        ? { ...s, current: e.index, last: undefined, notice: undefined }
        : s
    case 'mic-started':
      return s.phase === 'ready' && s.bubbles.length > 0 && !isDone(s) ? { ...s, phase: 'listening', last: undefined, notice: undefined } : s
    case 'mic-failed':
      return { ...kindRetry(s, e.denied ? 'mic.denied' : 'mic.unavailable'), canSkip: true }
    case 'stopped': // a second stop in the same frame is ignored
      return s.phase === 'listening' ? { ...s, phase: 'thinking' } : s
    case 'heard': {
      if (s.phase !== 'thinking') return s
      if (!e.text.trim()) return failed(s) // noise past the silence gate: a model miss, not the child's
      const bubble = s.bubbles[s.current]
      const tries = bubble.tries + 1
      if (matchesWord(bubble.word, e.text)) return pop(s, 'said', tries)
      if (tries >= MAX_TRIES) return pop(s, 'helped', tries)
      const bubbles = s.bubbles.map((b, i) => (i === s.current ? { ...b, tries } : b))
      return { ...s, bubbles, phase: 'ready', last: 'missed', notice: undefined, fails: 0 }
    }
    case 'silence':
      return s.phase === 'thinking' ? kindRetry(s, 'reading.silence') : s
    case 'failed':
      return s.phase === 'thinking' ? failed(s) : s
    case 'model-unavailable': // a load can fail mid-try: the try finishes, Skip stays for after it
      return s.phase === 'ready'
        ? { ...kindRetry(s, 'reading.modelUnavailable'), canSkip: true, noModel: true }
        : { ...s, canSkip: true, noModel: true }
    case 'skip':
      return s.canSkip && s.phase === 'ready' && s.bubbles.length > 0 && !isDone(s) ? { ...pop(s, 'helped', s.bubbles[s.current].tries), notice: s.notice } : s
  }
}
