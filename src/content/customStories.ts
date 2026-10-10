// Teachers' own stories: an adult pastes a short text and it becomes a Story saved only on this
// device (localStorage, never uploaded). This is content, not progress, so it has its own key.
import { STORIES, CUSTOM_KEY, type Level, type Story } from './stories'

export { CUSTOM_KEY }
export const MAX_SENTENCES = 20
export const MAX_WORDS = 15

/** Split pasted text into reading sentences at . ! ? and line breaks; very long lines are split by words. */
export function toSentences(text: string): string[] {
  const parts = text
    .split(/\n+/)
    .flatMap((line) => line.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/))
    .map((p) => p.trim())
    .filter((p) => /\p{L}/u.test(p))
  const out: string[] = []
  for (const p of parts) {
    const words = p.split(' ')
    for (let i = 0; i < words.length; i += MAX_WORDS) out.push(words.slice(i, i + MAX_WORDS).join(' '))
  }
  return out.slice(0, MAX_SENTENCES)
}

export function makeStory(title: string, text: string, level: Level, now = Date.now()): Story | undefined {
  const sentences = toSentences(text)
  const name = title.trim() || (sentences[0] ?? '').replace(/[.!?]+$/, '').split(' ').slice(0, 4).join(' ')
  if (!sentences.length || !name) return undefined
  return {
    id: `custom-${now}`,
    title: { fil: name, en: name },
    level,
    sentences: sentences.map((text) => ({ text })),
    custom: true,
  }
}

function isStory(s: unknown): s is Story {
  if (typeof s !== 'object' || s === null) return false
  const o = s as Record<string, unknown>
  const title = o.title as Record<string, unknown> | undefined
  return (
    typeof o.id === 'string' && o.id.startsWith('custom-') &&
    (o.level === 'easy' || o.level === 'medium' || o.level === 'hard') &&
    typeof title?.fil === 'string' && typeof title?.en === 'string' &&
    Array.isArray(o.sentences) && o.sentences.length > 0 &&
    o.sentences.every((x) => typeof (x as { text?: unknown })?.text === 'string')
  )
}

export function loadCustomStories(): Story[] {
  try {
    const raw = globalThis.localStorage?.getItem(CUSTOM_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(isStory) : []
  } catch (err) {
    console.warn('[stories] could not load custom stories', err)
    return []
  }
}

export function saveCustomStories(stories: Story[]): void {
  try {
    globalThis.localStorage?.setItem(CUSTOM_KEY, JSON.stringify(stories))
  } catch (err) {
    console.error('[stories] could not save custom stories', err)
  }
}

/** Built-in stories first, then the teacher's own. */
export function allStories(): Story[] {
  return [...STORIES, ...loadCustomStories()]
}
