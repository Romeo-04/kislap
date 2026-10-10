// "Pakinggan": reads a word aloud with a voice installed on the device (speechSynthesis).
// Only local voices are used (localService), so no text leaves the device (ADR-0007). Filipino or
// Tagalog first; Indonesian reads Filipino spelling almost the same way, so it is the fallback.

import { clipUrl, hasClip } from '../content/wordClips'

export interface VoiceLike {
  lang: string
  localService: boolean
  name: string
}

const PREFERENCE = ['fil', 'tl', 'id']

/** The best on-device voice for Filipino words, or undefined (then the Listen button hides). */
export function pickVoice<V extends VoiceLike>(voices: readonly V[]): V | undefined {
  const local = voices.filter((v) => v.localService)
  for (const prefix of PREFERENCE) {
    const found = local.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(prefix))
    if (found) return found
  }
  return undefined
}

function synth(): SpeechSynthesis | undefined {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : undefined
}

/** The voice to use now. Voices load late on some browsers; call again after 'voiceschanged'. */
export function localVoice(): SpeechSynthesisVoice | undefined {
  const s = synth()
  return s ? pickVoice(s.getVoices()) : undefined
}

export function onVoicesChanged(cb: () => void): () => void {
  const s = synth()
  if (!s) return () => {}
  s.addEventListener('voiceschanged', cb)
  return () => s.removeEventListener('voiceschanged', cb)
}

/** Says the word slowly. Does nothing without a local voice. */
export function sayWord(word: string): void {
  const s = synth()
  const voice = localVoice()
  if (!s || !voice) return
  s.cancel()
  const u = new SpeechSynthesisUtterance(word.replace(/[^\p{L}\s-]/gu, ''))
  u.voice = voice
  u.lang = voice.lang
  u.rate = 0.7 // slow and clear for a young reader
  s.speak(u)
}

/** A teammate's recording first (offline, every device); the device voice if there is none or it fails. */
export function listenWord(word: string): void {
  if (!hasClip(word)) return sayWord(word)
  new Audio(clipUrl(word)).play().catch((err) => {
    console.warn('[listen] recording failed, using the device voice', err)
    sayWord(word)
  })
}

/** Listen can play this word: it has a recording, or the device has a voice (`canListen`). */
export function canHear(word: string, canListen: boolean): boolean {
  return canListen || hasClip(word)
}
